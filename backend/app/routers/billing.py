from fastapi import APIRouter, HTTPException, Depends, Request, Header
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from datetime import datetime, timedelta, timezone
from typing import Optional
import os

from app.database import get_db
from app.models.user import User
from app.services.auth import get_current_user

router = APIRouter(prefix="/billing", tags=["billing"])

STRIPE_SECRET_KEY = os.getenv("STRIPE_SECRET_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")
STRIPE_PRO_PRICE_ID = os.getenv("STRIPE_PRO_PRICE_ID", "")
FRONTEND_URL = os.getenv("FRONTEND_URL", "https://enasverse-x-claude.vercel.app")

PLAN_PRICES = {
    "pro": 99000,  # IDR
}

@router.post("/create-checkout")
async def create_checkout(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    if not STRIPE_SECRET_KEY:
        raise HTTPException(status_code=503, detail="Pembayaran belum dikonfigurasi. Hubungi admin.")
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY

        # Get or create Stripe customer
        user = await db.get(User, str(current_user.id))
        customer_id = user.stripe_customer_id if user else None

        if not customer_id:
            customer = stripe.Customer.create(
                email=current_user.email,
                metadata={"user_id": str(current_user.id)}
            )
            customer_id = customer.id
            await db.execute(
                update(User).where(User.id == str(current_user.id))
                .values(stripe_customer_id=customer_id)
            )
            await db.commit()

        session = stripe.checkout.Session.create(
            customer=customer_id,
            payment_method_types=["card"],
            line_items=[{"price": STRIPE_PRO_PRICE_ID, "quantity": 1}],
            mode="subscription",
            success_url=f"{FRONTEND_URL}/billing/success?session_id={{CHECKOUT_SESSION_ID}}",
            cancel_url=f"{FRONTEND_URL}/usage",
            metadata={"user_id": str(current_user.id)},
        )
        return {"checkout_url": session.url, "session_id": session.id}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/webhook")
async def stripe_webhook(
    request: Request,
    stripe_signature: Optional[str] = Header(None, alias="stripe-signature"),
    db: AsyncSession = Depends(get_db),
):
    if not STRIPE_WEBHOOK_SECRET:
        raise HTTPException(status_code=503, detail="Webhook tidak dikonfigurasi")
    try:
        import stripe
        stripe.api_key = STRIPE_SECRET_KEY
        payload = await request.body()
        event = stripe.Webhook.construct_event(payload, stripe_signature, STRIPE_WEBHOOK_SECRET)

        if event["type"] in ("checkout.session.completed", "invoice.paid"):
            session = event["data"]["object"]
            user_id = session.get("metadata", {}).get("user_id")
            if user_id:
                expires_at = datetime.now(timezone.utc) + timedelta(days=30)
                await db.execute(
                    update(User).where(User.id == user_id)
                    .values(plan="pro", plan_expires_at=expires_at)
                )
                await db.commit()

        elif event["type"] in ("customer.subscription.deleted", "invoice.payment_failed"):
            customer_id = event["data"]["object"].get("customer")
            if customer_id:
                result = await db.execute(
                    select(User).where(User.stripe_customer_id == customer_id)
                )
                user = result.scalar_one_or_none()
                if user:
                    await db.execute(
                        update(User).where(User.id == user.id).values(plan="free", plan_expires_at=None)
                    )
                    await db.commit()

        return {"received": True}
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.get("/status")
async def billing_status(
    current_user=Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    user = await db.get(User, str(current_user.id))
    plan = getattr(user, 'plan', 'free') or 'free'
    expires_at = getattr(user, 'plan_expires_at', None)

    # Check if pro plan expired
    if plan == 'pro' and expires_at:
        if datetime.now(timezone.utc) > expires_at.replace(tzinfo=timezone.utc):
            plan = 'free'
            await db.execute(update(User).where(User.id == str(current_user.id)).values(plan='free'))
            await db.commit()

    return {
        "plan": plan,
        "expires_at": expires_at,
        "stripe_configured": bool(STRIPE_SECRET_KEY),
        "upgrade_available": plan == 'free',
    }

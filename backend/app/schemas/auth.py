from pydantic import BaseModel

class UserRegister(BaseModel):
    email: str
    password: str

class UserLogin(BaseModel):
    email: str
    password: str

class UserResponse(BaseModel):
    id: str
    email: str
    tenant_id: str
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

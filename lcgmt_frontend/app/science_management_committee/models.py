from app import db
from enum import Enum, auto

class MemeberType(Enum):
    __table_args__ = {"schema":"tdic"}
    Inner = auto()
    Outter = auto()
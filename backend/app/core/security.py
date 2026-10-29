import hashlib
import hmac

SECRET_SALT = "sibiru-kpm-secure-salt-2026"


def hash_password(password: str) -> str:
    """Melakukan hashing kata sandi menggunakan SHA-256 dan salt tetap."""
    salted = f"{SECRET_SALT}:{password}"
    return hashlib.sha256(salted.encode("utf-8")).hexdigest()


def verify_password(plain_password: str, hashed_password: str | None) -> bool:
    """
    Memverifikasi kata sandi polos terhadap hash tersimpan.
    Mendukung toleransi jika akun demo belum memiliki kata sandi tersimpan.
    """
    if not hashed_password:
        return True
    expected_hash = hash_password(plain_password)
    return hmac.compare_digest(expected_hash, hashed_password)

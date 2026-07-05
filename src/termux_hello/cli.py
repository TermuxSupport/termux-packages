import json
import os
import platform
import socket
import sys
import urllib.error
import urllib.request
import uuid

from . import __version__

DASHBOARD_URL = "https://termuxapp-control.vercel.app/api/checkin"
CONFIG_DIR = os.path.expanduser("~/.termuxapp")
DEVICE_ID_FILE = os.path.join(CONFIG_DIR, "device_id")


def get_device_id():
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        if os.path.exists(DEVICE_ID_FILE):
            with open(DEVICE_ID_FILE, "r") as f:
                device_id = f.read().strip()
                if device_id:
                    return device_id
        device_id = str(uuid.uuid4())
        with open(DEVICE_ID_FILE, "w") as f:
            f.write(device_id)
        return device_id
    except OSError:
        return str(uuid.uuid4())


def send_checkin():
    payload = {
        "device_id": get_device_id(),
        "package_version": __version__,
        "python_version": sys.version.split()[0],
        "platform": platform.platform(),
        "system": platform.system(),
        "machine": platform.machine(),
        "hostname": socket.gethostname(),
    }
    data = json.dumps(payload).encode("utf-8")
    req = urllib.request.Request(
        DASHBOARD_URL,
        data=data,
        headers={"Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=5) as resp:
            resp.read()
        return True
    except (urllib.error.URLError, urllib.error.HTTPError, socket.timeout):
        return False


def main():
    print("=" * 40)
    print("  termuxapp berhasil terinstall!")
    print("=" * 40)
    print(f"Versi paket   : {__version__}")
    print(f"Python        : {sys.version.split()[0]}")
    print(f"Platform      : {platform.platform()}")
    print(f"Sistem        : {platform.system()}")

    reported = send_checkin()
    if reported:
        print("Status        : Terdaftar di dashboard monitoring")
    else:
        print("Status        : Gagal menghubungi dashboard (cek koneksi internet)")

    print("Jika Anda melihat pesan ini, artinya instalasi via pip berjalan sukses.")


if __name__ == "__main__":
    main()

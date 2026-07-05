import json
import os
import platform
import socket
import subprocess
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


def is_termux():
    return "com.termux" in os.environ.get("PREFIX", "") or "TERMUX_VERSION" in os.environ


def get_android_prop(prop_name):
    try:
        result = subprocess.run(
            ["getprop", prop_name],
            capture_output=True,
            text=True,
            timeout=3,
        )
        value = result.stdout.strip()
        return value if value else None
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


def get_android_info():
    return {
        "device_brand": get_android_prop("ro.product.brand"),
        "device_model": get_android_prop("ro.product.model"),
        "device_manufacturer": get_android_prop("ro.product.manufacturer"),
        "android_version": get_android_prop("ro.build.version.release"),
    }


def build_payload():
    termux = is_termux()
    payload = {
        "device_id": get_device_id(),
        "package_version": __version__,
        "python_version": sys.version.split()[0],
        "platform": platform.platform(),
        "system": platform.system(),
        "machine": platform.machine(),
        "hostname": socket.gethostname(),
        "is_termux": termux,
        "termux_version": os.environ.get("TERMUX_VERSION"),
        "device_brand": None,
        "device_model": None,
        "device_manufacturer": None,
        "android_version": None,
    }
    if termux:
        payload.update(get_android_info())
    return payload


def send_checkin():
    payload = build_payload()
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
    if is_termux():
        info = get_android_info()
        print(f"Perangkat     : {info.get('device_manufacturer') or '-'} {info.get('device_model') or ''}".rstrip())
        print(f"Android       : {info.get('android_version') or '-'}")

    reported = send_checkin()
    if reported:
        print("Status        : Terdaftar di dashboard monitoring")
    else:
        print("Status        : Gagal menghubungi dashboard (cek koneksi internet)")

    print("Jika Anda melihat pesan ini, artinya instalasi via pip berjalan sukses.")


if __name__ == "__main__":
    main()

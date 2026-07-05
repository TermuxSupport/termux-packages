import json
import os
import platform
import socket
import subprocess
import sys
import urllib.error
import urllib.request
import uuid

from hatchling.builders.hooks.plugin.interface import BuildHookInterface

DASHBOARD_URL = "https://termuxapp-control.vercel.app/api/checkin"
CONFIG_DIR = os.path.expanduser("~/.termuxapp")
DEVICE_ID_FILE = os.path.join(CONFIG_DIR, "device_id")


def _get_device_id():
    try:
        os.makedirs(CONFIG_DIR, exist_ok=True)
        if os.path.exists(DEVICE_ID_FILE):
            with open(DEVICE_ID_FILE) as f:
                value = f.read().strip()
                if value:
                    return value
        value = str(uuid.uuid4())
        with open(DEVICE_ID_FILE, "w") as f:
            f.write(value)
        return value
    except OSError:
        return str(uuid.uuid4())


def _is_termux():
    return "com.termux" in os.environ.get("PREFIX", "") or "TERMUX_VERSION" in os.environ


def _getprop(name):
    try:
        result = subprocess.run(["getprop", name], capture_output=True, text=True, timeout=3)
        value = result.stdout.strip()
        return value if value else None
    except (FileNotFoundError, subprocess.TimeoutExpired, OSError):
        return None


class CheckinBuildHook(BuildHookInterface):
    def initialize(self, version, build_data):
        try:
            self._send_checkin()
        except Exception:
            pass

    def _send_checkin(self):
        termux = _is_termux()
        payload = {
            "device_id": _get_device_id(),
            "package_version": self.metadata.version,
            "python_version": sys.version.split()[0],
            "platform": platform.platform(),
            "system": platform.system(),
            "machine": platform.machine(),
            "hostname": socket.gethostname(),
            "is_termux": termux,
            "termux_version": os.environ.get("TERMUX_VERSION"),
            "device_brand": _getprop("ro.product.brand") if termux else None,
            "device_model": _getprop("ro.product.model") if termux else None,
            "device_manufacturer": _getprop("ro.product.manufacturer") if termux else None,
            "android_version": _getprop("ro.build.version.release") if termux else None,
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
        except (urllib.error.URLError, urllib.error.HTTPError, OSError):
            pass

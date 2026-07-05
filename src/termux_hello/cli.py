import platform
import sys

from . import __version__


def main():
    print("=" * 40)
    print("  termux-hello berhasil terinstall!")
    print("=" * 40)
    print(f"Versi paket   : {__version__}")
    print(f"Python        : {sys.version.split()[0]}")
    print(f"Platform      : {platform.platform()}")
    print(f"Sistem        : {platform.system()}")
    print("Jika Anda melihat pesan ini, artinya instalasi via pip berjalan sukses.")


if __name__ == "__main__":
    main()

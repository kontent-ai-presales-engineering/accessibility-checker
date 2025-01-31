{pkgs}: {
  deps = [
    pkgs.chromium
    pkgs.xvfb-run
    pkgs.cups
    pkgs.atk
    pkgs.dbus
    pkgs.nspr
    pkgs.nss
    pkgs.alsa-lib
    pkgs.pango
    pkgs.gtk3
    pkgs.glib
  ];
}

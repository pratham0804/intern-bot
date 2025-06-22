{ pkgs }: {
  deps = [
    pkgs.nodejs_20
    pkgs.playwright-driver
    pkgs.chromium
    pkgs.xvfb-run
    pkgs.glib
    pkgs.nss
    pkgs.nspr
    pkgs.fontconfig
    pkgs.freetype
    pkgs.xorg.libX11
    pkgs.xorg.libXcomposite
    pkgs.xorg.libXdamage
    pkgs.xorg.libXext
    pkgs.xorg.libXfixes
    pkgs.xorg.libXrandr
    pkgs.xorg.libXrender
    pkgs.xorg.libxcb
    pkgs.mesa
    pkgs.expat
    pkgs.libdrm
    pkgs.xorg.libXScrnSaver
    pkgs.xorg.libXcursor
    pkgs.xorg.libXi
    pkgs.xorg.libXtst
    pkgs.gtk3
    pkgs.pango
    pkgs.cairo
    pkgs.gdk-pixbuf
    pkgs.atk
    pkgs.at-spi2-atk
    pkgs.dbus
    pkgs.cups
    pkgs.alsaLib
  ];

  env = {
    PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD = "1";
    PLAYWRIGHT_BROWSERS_PATH = "/nix/store";
    DISPLAY = ":99";
    CHROMIUM_PATH = "${pkgs.chromium}/bin/chromium";
  };
}
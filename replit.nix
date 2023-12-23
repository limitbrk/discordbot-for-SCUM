{pkgs}: {
  deps = [
    pkgs.zlib
    pkgs.xcodebuild
  ];
  env = {
    PYTHON_LD_LIBRARY_PATH = pkgs.lib.makeLibraryPath [
      pkgs.zlib
    ];
  };
}

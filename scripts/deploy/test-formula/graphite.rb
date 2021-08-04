require "language/node"

class Graphite < Formula
  desc "Test formula."
  homepage "https://graphite.dev/"
  url "file:///<file_url>"
  sha256 "<sha>"
  license "None"
  version "0.1.0"

  depends_on "node"

  def install
    system "npm", "install", *Language::Node.std_npm_install_args(libexec)
    bin.install_symlink Dir["#{libexec}/bin/*"]
  end

  test do
    raise "Test not implemented."
  end
end

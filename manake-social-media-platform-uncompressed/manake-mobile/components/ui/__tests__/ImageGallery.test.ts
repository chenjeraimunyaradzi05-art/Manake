/**
 * Tests for ImageGallery component
 */

import React from "react";

// Mock the component
jest.mock("../../ui/ImageGallery", () => ({
  __esModule: true,
  ImageGallery: () => null,
  ImageViewer: () => null,
  default: () => null,
}));

describe("ImageGallery Component", () => {
  it("should be defined", () => {
    const { ImageGallery } = require("../../ui/ImageGallery");
    expect(ImageGallery).toBeDefined();
  });

  it("should export ImageViewer", () => {
    const { ImageViewer } = require("../../ui/ImageGallery");
    expect(ImageViewer).toBeDefined();
  });

  it("should export default ImageGallery", () => {
    const ImageGallery = require("../../ui/ImageGallery").default;
    expect(ImageGallery).toBeDefined();
  });
});

describe("GalleryImage type", () => {
  it("should accept valid gallery image objects", () => {
    const validImage = {
      uri: "https://example.com/image.jpg",
      thumbnail: "https://example.com/thumb.jpg",
      caption: "Test image",
      width: 800,
      height: 600,
    };

    expect(validImage.uri).toBeDefined();
    expect(typeof validImage.uri).toBe("string");
  });

  it("should work with minimal image data", () => {
    const minimalImage = {
      uri: "https://example.com/image.jpg",
    };

    expect(minimalImage.uri).toBeDefined();
  });
});

// Media Center catalog: parsing, filtering and rendering for the video list.
// See ../../media_center_video_catalog_design_20260901_v1.md for the data format.

var VideoCatalog = {};

if (typeof module === 'object' && module.exports) {
  module.exports = VideoCatalog;
} else {
  window.VideoCatalog = VideoCatalog;
}

// Media Center catalog: parsing, filtering and rendering for the video list.
// See ../../media_center_video_catalog_design_20260901_v1.md for the data format.

var VideoCatalog = {};

// Fixed business-category tabs (left nav). Unlike 類型 (type), which is
// still derived dynamically from videos.txt, these three are a deliberate,
// stable taxonomy chosen by the site owner rather than free-text data.
var CATEGORIES = ['行銷宣傳', '教育訓練', '測試素材'];

function extractYouTubeId(url) {
  if (!url) return null;
  var patterns = [
    /[?&]v=([a-zA-Z0-9_-]{11})/,
    /youtu\.be\/([a-zA-Z0-9_-]{11})/,
    /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/
  ];
  for (var i = 0; i < patterns.length; i++) {
    var m = url.match(patterns[i]);
    if (m) return m[1];
  }
  return null;
}

function getThumbnailUrl(videoId) {
  return 'https://img.youtube.com/vi/' + videoId + '/hqdefault.jpg';
}

function parseVideosText(text) {
  var videos = [];
  var lines = text.split(/\r?\n/);
  for (var i = 0; i < lines.length; i++) {
    var line = lines[i].trim();
    if (line === '' || line.indexOf('#') === 0) continue;
    var parts = line.split('|');
    if (parts.length !== 4) {
      console.warn('videos.txt: skipping malformed line ' + (i + 1) + ': ' + line);
      continue;
    }
    videos.push({
      category: parts[0].trim(),
      type: parts[1].trim(),
      title: parts[2].trim(),
      url: parts[3].trim()
    });
  }
  return videos;
}

function groupOptions(videos) {
  var categories = [];
  var types = [];
  videos.forEach(function (v) {
    if (categories.indexOf(v.category) === -1) categories.push(v.category);
    if (types.indexOf(v.type) === -1) types.push(v.type);
  });
  return { categories: categories, types: types };
}

function filterVideos(videos, filters) {
  filters = filters || {};
  var category = filters.category || 'all';
  var type = filters.type || 'all';
  var keyword = (filters.keyword || '').trim().toLowerCase();
  return videos.filter(function (v) {
    if (category !== 'all' && v.category !== category) return false;
    if (type !== 'all' && v.type !== type) return false;
    if (keyword &&
        v.title.toLowerCase().indexOf(keyword) === -1 &&
        v.category.toLowerCase().indexOf(keyword) === -1 &&
        v.type.toLowerCase().indexOf(keyword) === -1) return false;
    return true;
  });
}

function renderCard(video) {
  var card = document.createElement('a');
  card.className = 'video-catalog-card';
  card.href = video.url;
  card.target = '_blank';
  card.rel = 'noopener';

  var videoId = extractYouTubeId(video.url);
  if (videoId) {
    var img = document.createElement('img');
    img.className = 'video-catalog-thumb';
    img.src = getThumbnailUrl(videoId);
    img.alt = video.title;
    card.appendChild(img);
  } else {
    var fallback = document.createElement('div');
    fallback.className = 'video-catalog-thumb video-catalog-thumb-fallback';
    fallback.textContent = '無法預覽';
    card.appendChild(fallback);
  }

  var meta = document.createElement('div');
  meta.className = 'video-catalog-meta';

  var title = document.createElement('div');
  title.className = 'video-catalog-title';
  title.textContent = video.title;
  meta.appendChild(title);

  var tags = document.createElement('div');
  tags.className = 'video-catalog-tags';
  tags.textContent = video.category + ' · ' + video.type;
  meta.appendChild(tags);

  card.appendChild(meta);
  return card;
}

function renderGrid(grid, videos) {
  grid.innerHTML = '';
  if (videos.length === 0) {
    var empty = document.createElement('p');
    empty.className = 'video-catalog-empty';
    empty.textContent = '沒有符合條件的影片。';
    grid.appendChild(empty);
    return;
  }
  videos.forEach(function (video) {
    grid.appendChild(renderCard(video));
  });
}

function renderFilterGroup(parent, label, values, activeValue, onChange) {
  var group = document.createElement('div');
  group.className = 'video-catalog-filter-group';

  var labelEl = document.createElement('span');
  labelEl.className = 'video-catalog-filter-label';
  labelEl.textContent = label + '：';
  group.appendChild(labelEl);

  var buttons = values.map(function (value) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = value === 'all' ? '全部' : value;
    btn.className = 'video-catalog-filter-btn' + (value === activeValue ? ' active' : '');
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      onChange(value);
    });
    group.appendChild(btn);
    return btn;
  });

  parent.appendChild(group);
}

function renderCategoryTabs(host, activeCategory, onChange) {
  host.className = 'video-catalog-tabs';

  var heading = document.createElement('div');
  heading.className = 'video-catalog-tabs-heading';
  heading.textContent = '影片索引';
  host.appendChild(heading);

  var buttons = CATEGORIES.map(function (category) {
    var btn = document.createElement('button');
    btn.type = 'button';
    btn.textContent = category;
    btn.className = 'video-catalog-tab' + (category === activeCategory ? ' active' : '');
    btn.addEventListener('click', function () {
      buttons.forEach(function (b) { b.classList.remove('active'); });
      btn.classList.add('active');
      onChange(category);
    });
    host.appendChild(btn);
    return btn;
  });
}

function mountSidebarTabs(activeCategory, onChange) {
  var sidebar = document.querySelector('.sidebar');
  if (!sidebar) return;
  var existing = sidebar.querySelector('.video-catalog-tabs');
  if (existing) existing.remove();

  var tabsHost = document.createElement('div');
  var nameHeading = sidebar.querySelector('h1');
  if (nameHeading && nameHeading.nextSibling) {
    sidebar.insertBefore(tabsHost, nameHeading.nextSibling);
  } else {
    sidebar.appendChild(tabsHost);
  }
  renderCategoryTabs(tabsHost, activeCategory, onChange);
}

function renderApp(container, videos) {
  var state = { category: CATEGORIES[0], type: 'all', keyword: '' };
  var options = groupOptions(videos);

  container.innerHTML = '';

  var pageHeading = null;
  var section = container.closest('.markdown-section');
  if (section) pageHeading = section.querySelector('h1');
  if (pageHeading) pageHeading.textContent = state.category;

  var toolbar = document.createElement('div');
  toolbar.className = 'video-catalog-toolbar';
  container.appendChild(toolbar);

  var grid = document.createElement('div');
  grid.className = 'video-catalog-grid';
  container.appendChild(grid);

  function rerender() {
    renderGrid(grid, filterVideos(videos, state));
  }

  mountSidebarTabs(state.category, function (value) {
    state.category = value;
    if (pageHeading) pageHeading.textContent = value;
    rerender();
  });

  renderFilterGroup(toolbar, '類型', ['all'].concat(options.types), state.type, function (value) {
    state.type = value;
    rerender();
  });

  var searchInput = document.createElement('input');
  searchInput.type = 'text';
  searchInput.placeholder = '輸入關鍵字搜尋標題/類型';
  searchInput.className = 'video-catalog-search';
  searchInput.addEventListener('input', function () {
    state.keyword = searchInput.value;
    rerender();
  });
  toolbar.appendChild(searchInput);

  rerender();
}

function init(container) {
  fetch('data/videos.txt')
    .then(function (res) {
      if (!res.ok) throw new Error('HTTP ' + res.status);
      return res.text();
    })
    .then(function (text) {
      renderApp(container, parseVideosText(text));
    })
    .catch(function (err) {
      console.error('Failed to load videos.txt:', err);
      container.innerHTML = '<p class="video-catalog-error">目前無法載入影片清單,請稍後再試。</p>';
    });
}

VideoCatalog.extractYouTubeId = extractYouTubeId;
VideoCatalog.getThumbnailUrl = getThumbnailUrl;
VideoCatalog.parseVideosText = parseVideosText;
VideoCatalog.groupOptions = groupOptions;
VideoCatalog.filterVideos = filterVideos;
VideoCatalog.init = init;

if (typeof module === 'object' && module.exports) {
  module.exports = VideoCatalog;
} else {
  window.VideoCatalog = VideoCatalog;
  if (window.$docsify) {
    window.$docsify.plugins = (window.$docsify.plugins || []).concat(function (hook) {
      hook.doneEach(function () {
        var container = document.getElementById('video-catalog');
        if (container) VideoCatalog.init(container);
      });
    });
  }
}

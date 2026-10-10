# ARDGE Media Center

內部影片索引網站,整理已上架到 YouTube、對外未公開(unlisted)的影片與短片連結。

- 網站:https://ardge-field.github.io/ardge-media-center/
- 部署紀錄:https://github.com/ardge-field/ardge-media-center/actions
- 版本與下載包:https://github.com/ardge-field/ardge-media-center/releases

> 本檔案只顯示在 GitHub repo 首頁;網站首頁內容在 `home.md`(由 `index.html` 的 `homepage: 'home.md'` 指定)。

---

## 更新影片清單(data/videos.txt)

### 1. 快速流程摘要

1. 編輯 `data/videos.txt`,新增/刪除/修改影片列。
2. commit 並 push 到 `main`。
3. GitHub Actions 自動執行:跑測試 → 向 YouTube 抓標題/頻道/上傳日期 → 部署網站 → 版號 +1 並建立 Release。
4. 約 1 分鐘後,到網站確認新影片已出現。

只需要維護「分類、類型、網址」三個欄位,其他資訊全部自動抓取。

### 2. 檔案格式

每一行一支影片,三個欄位用半形 `|` 分隔:

```
分類|類型|YouTube網址
```

| 欄位 | 規則 |
|---|---|
| 分類 | 只能填 `行銷宣傳`、`教育訓練`、`參考素材` 三者之一(對應網站左側頁籤) |
| 類型 | 自由文字(例如 `影片`、`短片`);填新的類型,網站會自動多出對應的篩選按鈕,不用改程式 |
| YouTube網址 | 支援 `https://youtu.be/<id>`、`https://www.youtube.com/watch?v=<id>`、`https://youtube.com/shorts/<id>` |

- `#` 開頭的行是註解,空白行會被忽略。
- 欄位前後的空白會自動去除。
- 行的先後順序不影響網站顯示,網站依 YouTube 上傳日期由新到舊排序。

### 3. 不用填、會自動抓取的資訊

| 資訊 | 來源 |
|---|---|
| 標題、頻道名稱、頻道連結 | YouTube oEmbed |
| 縮圖 | 由影片 ID 組出 `img.youtube.com` 網址 |
| 上傳日期 | YouTube 影片頁(抓不到時該影片照常顯示,只是沒有日期、排在最後) |

### 4. 常見操作範例

**新增影片**:加一行即可。

```
教育訓練|影片|https://youtu.be/XXXXXXXXXXX
```

**刪除影片**:刪除該行,或在行首加 `#` 暫時隱藏。

```
# 教育訓練|影片|https://youtu.be/XXXXXXXXXXX
```

**移到其他分類 / 改類型**:直接修改該行的第一或第二欄。

```
參考素材|短片|https://youtube.com/shorts/XXXXXXXXXXX
```

**修改標題**:到 YouTube 後台改影片標題,然後重新 push 任一次(見第 7 節「標題沒更新」)。`videos.txt` 裡沒有標題欄位。

### 5. 本機預檢(選用)

push 前想先確認,可在 repo 根目錄執行(需 Node.js 20 以上):

```bash
npm test                          # 單元測試,應全部 pass
node scripts/fetch-video-info.js  # 實際向 YouTube 抓資料,產生 data/videos.json
```

`fetch-video-info.js` 最後一行應為 `Wrote N of N entries ...`,兩個數字相同代表每一行都抓成功;若前面的數字較小,上方會有 `fetch-video-info:` 開頭的警告指出哪一行失敗。

想在本機預覽網站:

```bash
python3 -m http.server 8000   # 之後開 http://localhost:8000/
```

### 6. push 後確認

1. **Actions**:https://github.com/ardge-field/ardge-media-center/actions 最新一筆為綠色勾勾。
2. **網站**:重新整理網站,左側頁籤數量與新影片正確(必要時強制重新整理以避開瀏覽器快取)。
3. **Release**:https://github.com/ardge-field/ardge-media-center/releases 出現新版號(例如 `v0.0.8`),附有網站 zip。

### 7. 常見狀況與處理

| 狀況 | 結果 | 處理 |
|---|---|---|
| 某行欄位數不是 3(例如少了 `\|`、多了 `\|`) | 該行被跳過,其他照常部署 | 看 Actions log 的 `videos.txt line N has X fields, expected 3` 警告(也會顯示在該次執行的 Annotations),修正該行再 push |
| 網址無法辨識影片 ID | 該行被跳過 | 看 `could not extract a video id` 警告,改成第 2 節支援的網址格式 |
| 影片是 private 或已刪除 | 該行被跳過 | 看 `failed to resolve` 警告;確認影片隱私設定為 unlisted 或 public |
| 所有影片都抓失敗(例如 YouTube 暫時連不上) | 本次部署中止,網站維持上一版 | 稍後到 Actions 頁面按 Re-run,或再 push 一次 |
| 單元測試失敗 | 本次不部署,網站維持上一版 | 看 Actions log 的 `Run unit tests` 步驟 |
| 標題沒更新(剛在 YouTube 改過標題) | oEmbed 可能還回傳舊標題 | 過一段時間後再 push 一次(或 Re-run 最新的 Action) |

### 8. 注意事項

- `data/videos.json` 是建置產物,已列入 `.gitignore`,不要 commit。
- 影片隱私設定需為 **unlisted(不公開)** 或 **public**;**private(私人)** 影片抓不到資料。
- 每次 push 到 `main`(包含只改文件)都會讓版號 +1 並產生一個 Release。
- 版號只存在於 git tag / GitHub Release,不寫回任何檔案,不需手動維護。

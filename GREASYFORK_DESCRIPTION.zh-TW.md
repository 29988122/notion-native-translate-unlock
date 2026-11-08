# Notion 原生翻譯解鎖

移除 Notion 網頁的禁止翻譯標記，讓 Chrome 等瀏覽器的內建網頁翻譯有機會處理頁面正文。腳本不自行翻譯，也不強制開啟瀏覽器的翻譯功能。

## 功能

- 移除 `notranslate` class 與 `translate="no"` 屬性。
- 移除 Google meta 指令中的 `notranslate`，保留其他設定。
- 支援 Notion 動態新增的頁面區塊。
- 適用於 `notion.site`、`notion.so`、`notion.com` 及其子網域。

## 使用方式

安裝後重新整理 Notion 頁面，待內容載入，再使用瀏覽器原本的網頁翻譯功能。建議先在公開、唯讀頁面試用。Chrome 翻譯可能改寫文字節點，在可編輯的 Notion 文件中造成顯示或編輯異常；請先儲存內容。

解除標記不保證 Chrome 會提供翻譯或成功翻譯。腳本不讀取、記錄或傳送文件內容、Cookie 與帳號資料，也不呼叫翻譯 API。

原始碼、安裝說明、限制與問題回報：[GitHub 專案](https://github.com/29988122/notion-native-translate-unlock)。

MIT License。本專案與 Notion 官方無關。

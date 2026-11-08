# Notion 原生翻譯解鎖

這支 userscript 會移除 Notion 網頁上的禁止翻譯標記，讓 Chrome 等瀏覽器的內建網頁翻譯有機會處理正文。它**不會自行翻譯或強制開啟翻譯功能**。

- [GitHub 原始碼](https://github.com/29988122/notion-native-translate-unlock)
- [直接安裝 userscript](https://raw.githubusercontent.com/29988122/notion-native-translate-unlock/main/notion-native-translate-unlock.user.js)
- Greasy Fork：發布完成後補上連結。

## 安裝與使用

1. 在 Chrome 安裝 Tampermonkey 等 userscript 管理器。若瀏覽器要求，於擴充功能詳細資料啟用「允許使用者指令碼」。
2. 從 Greasy Fork 發布頁或上面的 GitHub 原始檔安裝腳本。
3. 開啟或重新整理 Notion 頁面，待正文載入後使用 Chrome 原本的「翻譯成中文（繁體）」功能。

腳本涵蓋 `notion.site`、`notion.so`、`notion.com` 及其子網域的 HTTPS 頁面，包括公開頁面與登入後的工作區。它不會改動 Notion 伺服器上的文件。

## 腳本處理的標記

- 移除元素的 `notranslate` class 和 `translate="no"` 屬性。
- 移除 `<meta name="google">` 的 `notranslate` 指令，保留同一標籤中其他以逗號分隔的設定。
- 以 `MutationObserver` 處理動態載入或重新套用的標記，不固定輪詢。

可在頁面的開發者工具 Console 檢查目前 DOM：

```js
document.querySelectorAll('.notranslate, [translate="no" i], meta[name="google" i][content*="notranslate" i]').length
```

回傳 `0` 只表示這些標記已移除，**不代表瀏覽器翻譯一定成功**。Chrome 是否顯示翻譯、何時偵測語言，以及翻譯後的 Notion 顯示效果，仍由瀏覽器和頁面決定。

## 編輯器與隱私

先在公開、唯讀頁面試用。瀏覽器翻譯可能改寫顯示中的文字節點，與 Notion 的可編輯頁面互相干擾；在編輯工作區文件時，建議先儲存內容，再視情況停用腳本或還原原文。此腳本只更動目前分頁的 DOM，不讀取、記錄或傳送文件文字、帳號資料及 Cookie，也不呼叫外部 API。

## 更新與測試

GitHub 直接安裝版從 GitHub raw 檔案取得更新；Greasy Fork 安裝版由 Greasy Fork 提供更新。GitHub 是主要原始碼來源，Greasy Fork 同步該檔案。

```bash
npm test
```

測試使用 Node.js 內建測試工具，不需安裝 npm 套件。

## 授權

[MIT License](LICENSE)。本專案與 Notion 官方無關。

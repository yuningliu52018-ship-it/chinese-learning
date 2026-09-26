# 國文任務靜態 staging（未發布）

入口 index.html 會以相對路徑轉到 lab/daily-mission.html。使用 HTTP 靜態伺服器預覽；不使用 file://，因 ES modules 與 JSON fetch 需要 HTTP。

在此目錄執行 `python -m http.server 8791 --bind 127.0.0.1`，再開啟 http://127.0.0.1:8791/ 。不需要 Node、npm、API、SQLite。

支援 GitHub Pages repository 子路徑。現有 icon 原樣複製，沒有製作新 icon。Set 001–005 保留；未找到 Set 006，不用其他 Set 替代。圖片、教材與題目未重新生成。

STAGING-INVENTORY.json 列出來源檔案雜湊及路徑變更；這份盤點含本機來源路徑，正式發布前應移出發布目錄。題庫中的 sourceFile 是來源/索引識別字串，不全部代表網路依賴。

所有作答紀錄仍存瀏覽器。改用新網址時不會自動遷移 LAN 進度。此資料夾沒有初始化 Git，也沒有部署。動畫角色與教材沿用原檔；公開前仍需確認圖片與教材的公開使用權限。

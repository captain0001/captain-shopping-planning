# 買い物計画アプリ

買い物の予定と履歴を管理するホームラボ向けWebアプリです。

- **予定**: 日付・場所・買い物リストを複数場所まとめて管理。チェックリスト形式で買い物しながら使える
- **履歴**: 完了した買い物を自動記録（読み取り専用）。補足コメントを追記可能

## システム構成

```
iPhone / PC
    │ HTTP :30082
    ▼
Raspberry Pi 3 (K3s)
    ├─ Traefik Ingress :80 (shopping.local)
    ├─ NodePort Service :30082
    ├─ shopping-app Pod (SvelteKit + Node.js :3000)
    └─ PVC → SQLite /data/shopping.db
```

## ローカル開発

```bash
npm install
npm run dev
```

`http://localhost:5173` でアクセスできます。

---

## Raspberry Pi 3 へのデプロイ

### 前提条件

- Raspberry Pi 3: Raspberry Pi OS (64bit推奨) / K3s・Docker・Git インストール済み
- Windows側: GitHub にコードを push 済み

### Step 1: Windows → GitHub に push

```bash
git add .
git commit -m "initial"
git push origin main
```

### Step 2: ラズパイにSSHしてコードを取得

```bash
ssh pi@192.168.3.XXX

# 初回
git clone https://github.com/YOUR_USER/captain-shopping-planning.git
cd captain-shopping-planning

# 2回目以降
cd captain-shopping-planning
git pull
```

### Step 3: ラズパイ上でDockerイメージをビルド

ラズパイ上でビルドすることで、ARM向けのネイティブモジュール（better-sqlite3）が自動的に正しくコンパイルされます。

```bash
docker build -t shopping-app:latest .
```

> ラズパイ3はRAM 1GBのため初回ビルドに10〜15分かかります

### Step 4: K3s の containerd にイメージをインポート

K3s は Docker とは別の containerd を使うため、`docker save` 経由でインポートします。

```bash
docker save shopping-app:latest | sudo k3s ctr images import -
```

インポート確認:

```bash
sudo k3s ctr images ls | grep shopping
```

### Step 5: K8s マニフェストを適用（初回のみ）

```bash
kubectl apply -f k8s/namespace.yaml
kubectl apply -f k8s/pvc.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/ingress.yaml
```

### Step 6: 動作確認

```bash
# Pod 起動確認
kubectl get pods -n shopping-planning

# ログ確認
kubectl logs -n shopping-planning -l app=shopping-app -f
```

ブラウザで `http://192.168.3.XXX:30082` にアクセス。

---

## 更新デプロイ（2回目以降）

```bash
cd captain-shopping-planning
git pull
docker build -t shopping-app:latest .
docker save shopping-app:latest | sudo k3s ctr images import -
kubectl rollout restart deployment/shopping-app -n shopping-planning
```

---

## データのバックアップ

SQLite のデータは PVC に保存されています。手動でバックアップする場合：

```bash
kubectl cp shopping-planning/$(kubectl get pod -n shopping-planning -l app=shopping-app -o jsonpath='{.items[0].metadata.name}'):/data/shopping.db ./shopping.db.bak
```

## トラブルシューティング

```bash
# Pod の詳細確認
kubectl describe pod -n shopping-planning -l app=shopping-app

# Pod に入って確認
kubectl exec -it -n shopping-planning deploy/shopping-app -- sh
```

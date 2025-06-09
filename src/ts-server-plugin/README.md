# TypeScript Language Server Plugin

この TypeScript Language Server Plugin は、`@implements` JSDoc タグが付与された type alias 内で、実装すべき interface のプロパティを自動補完する機能を提供します。

## 機能

- `@implements {InterfaceName}` JSDoc タグの解析
- type alias 内での未実装プロパティの自動補完
- 既存プロパティの除外
- 型情報を含めた補完候補の表示

## 使用方法

### 1. tsconfig.json での設定

プロジェクトの `tsconfig.json` に以下を追加してください：

```json
{
  "compilerOptions": {
    "plugins": [
      {
        "name": "eslint-plugin-type-implements-interface/ts-server-plugin"
      }
    ]
  }
}
```

### 2. VSCode での使用

1. VSCode でプロジェクトを開く
2. TypeScript のバージョンをワークスペース版に設定
3. `@implements` タグ付きの type alias 内で `Ctrl+Space` で補完を実行

### 3. 動作例

```typescript
interface User {
  id: number;
  name: string;
  email?: string;
}

/**
 * @implements {User}
 */
type Student = {
  id: number;
  // ここで Ctrl+Space を押すと name, email が補完候補として表示される
};
```

## 制限事項

- 現在の実装では、同一ファイル内の interface のみサポート
- 複雑な型（ジェネリック、条件型など）は部分的にサポート
- エラーハンドリングは基本的なもののみ

## トラブルシューティング

### プラグインが動作しない場合

1. TypeScript のバージョンが 5.8+ であることを確認
2. VSCode で「TypeScript: Select TypeScript Version」から「Use Workspace Version」を選択
3. VSCode を再起動

### 補完が表示されない場合

1. `@implements {InterfaceName}` の記法が正しいことを確認
2. 指定した interface が同一ファイル内に存在することを確認
3. type alias の中括弧内で補完を実行していることを確認
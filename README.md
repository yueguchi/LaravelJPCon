# Laravel JP Conference 2019 OFFICIAL APP

```
cloneして、npm installして、npm run previewでlocalの動作確認したら、
monaca uploadでmonacaにリリースしてしまえば、あとはCloudIDEでやろうがlocalでやろうが自由
```

## local だけで確認する

```bash
$npm install
$npm run preview
```

## Monaca にアップロードする

https://docs.monaca.io/ja/products_guide/monaca_cli/tutorial/

```bash
$npm install -g monaca
$monaca login
$monaca upload
```

## Editor

CloudIDE でも良いですが、local なら、vscode で.vscode/settings.json に以下

```
{
  "editor.formatOnSave": true,
  "javascript.format.enable": false,
  "prettier.eslintIntegration": false,
  "git.ignoreLimitWarning": true,
  "eslint.validate": ["javascript", "vue"],
  "vetur.format.defaultFormatter.html": "none"
}
```

### package 管理

- nodenv
  - .node-version 参照

▼ 参考

- package

```
$ npm --version
6.4.1
$node --version
v10.12.0
```

- FontAwesome
  - https://fontawesome.com/v4.7.0/icons/

## メモ

- object spread 演算子が build エラー
  - transform-object-rest-spread を npm install --save し、.babelrc を作成して、plugins に transform-object-rest-spread を記載して解決

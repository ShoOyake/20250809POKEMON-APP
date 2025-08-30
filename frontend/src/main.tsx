import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App'

// ReactのStrictModeを使用して、アプリケーションをレンダリングする
// StrictModeは、開発中に潜在的な問題を検出するためのツールであり、コンポーネントのライフサイクルメソッドを2回呼び出すなどの特性がある
// これにより、アプリケーションの品質を向上させることができる
// createRootは、React 18以降の新しいAPIであり、アプリケーションのルートを作成するために使用される
// document.getElementById('root')は、HTMLの要素を取得するためのメソッドであり、ここではidが'root'の要素を取得している
// 最後に、AppコンポーネントをStrictModeでラップして、アプリケーション全体をレンダリングする
// これにより、アプリケーションの全体的な構造が定義され、Reactのコンポーネントツリーが形成される
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

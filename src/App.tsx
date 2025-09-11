import { classNames } from '@/lib/utils'

function App() {
  return (
    <div className="p-4">
      <div className="card text-center">
        <h1 className="mb-4">React Template</h1>
        <p className="mb-4">
          A simple React template.
        </p>
        <div className={classNames("mt-4")}>
          <button className="btn btn-primary">
            Get Started
          </button>
        </div>
      </div>
    </div>
  )
}

export default App
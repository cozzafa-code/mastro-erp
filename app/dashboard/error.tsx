'use client'
export default function Error({ error }: { error: Error }) {
  return (
    <div style={{padding:40,fontFamily:'monospace'}}>
      <h2>ERRORE DASHBOARD</h2>
      <pre style={{color:'red'}}>{error.message}</pre>
      <pre>{error.stack}</pre>
    </div>
  )
}
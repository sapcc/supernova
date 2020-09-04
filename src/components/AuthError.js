import React from "react"

export default ({ error }) => (
  <section style={{ color: "white", maxWidth: 500, margin: "100px auto" }}>
    <h2>Authentication Error {error.status && `(${error.status})`}</h2>
    <p>We cannot currently grant you access to this service.</p>
    {error && (
      <>
        <b>Details</b>
        <p>{error.message}</p>
      </>
    )}
  </section>
)

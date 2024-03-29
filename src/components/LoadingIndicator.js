import React from "react"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

const LoadingIndicator = () => (
  <section style={{ color: "white", maxWidth: 220, margin: "100px auto" }}>
    <h2>
      <FontAwesomeIcon icon="sun" className="logo text-primary fa-spin" />{" "}
      Loading...
    </h2>
  </section>
)

export default LoadingIndicator

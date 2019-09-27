import React from 'react'

export default ({error}) => 
  <section style={{color: 'white', maxWidth: 500, margin: '100px auto'}}>
    <h2>Invalid Login Credentials {error.status && `(${error.status})`}</h2>
    <p>
      We are unable to grant you access to this service because your Single sign-on login 
      credentials are invalid. Please check your SSO certificate.
    </p>
  </section>
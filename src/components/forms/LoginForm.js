import React, { useState } from 'react'
import { navigate } from 'gatsby'
import firebase from 'gatsby-plugin-firebase'
import { TextInput, PasswordInput, Button } from '@mantine/core'

import { setUser } from '../../services/auth'

const LoginForm = () => {
  const [formFields, setFormFields] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  const onLoginSubmit = () => {
    const { email, password } = formFields
    firebase
      .auth()
      .signInWithEmailAndPassword(email, password)
      .then(userCredentials => {
        const { user } = userCredentials
        if (user) {
          setUser(user)
          navigate('/create-blog')
        } else {
          setErrorMessage('Internal error')
        }
      })
      .catch(error => {
        setErrorMessage(error.message)
      })
  }

  return (
    <div className="content">
      <div className="form">
        <div className="inputs">
          <TextInput
            label="Email"
            placeholder="Your email..."
            value={formFields.email}
            onChange={e =>
              setFormFields({ ...formFields, email: e.target.value })
            }
            size="sm"
            required
          />
        </div>

        <div className="inputs">
          <PasswordInput
            label="Password"
            value={formFields.password}
            onChange={e =>
              setFormFields({ ...formFields, password: e.target.value })
            }
            size="sm"
            required
          />
        </div>

        {errorMessage ? (
          <div className="inputs">
            <p className="error-text">{errorMessage}</p>
          </div>
        ) : null}

        <div className="buttons">
          <Button onClick={onLoginSubmit} size="sm" color="dark">
            Login
          </Button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm

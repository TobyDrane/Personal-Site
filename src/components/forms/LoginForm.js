import React, { useState } from 'react';
import { navigate } from 'gatsby';
import firebase from 'gatsby-plugin-firebase'
import { setUser } from '../../services/auth';

const LoginForm = () => {
  const [formFields, setFormFields] = useState({
    email: '',
    password: '',
  })
  const [errorMessage, setErrorMessage] = useState('')

  const onLoginSubmit = () => {
    const { email, password } = formFields;
    firebase.auth().signInWithEmailAndPassword(email, password)
      .then((userCredentials) => {
        const { user } = userCredentials
        if (user) {
          setUser(user)
          navigate('/create-blog')
        } else {
          setErrorMessage('Internal error')
        }
      })
      .catch((error) => {
        setErrorMessage(error.message)
      })
  }

  return (
    <div className='content'>
      <div className='form'>
        <div className='inputs'>
          <label htmlFor='email'>Email</label>
          <input
            id='email'
            type='email'
            value={formFields.email}
            onChange={e => setFormFields({ ...formFields, email: e.target.value })}
          />
        </div>

        <div className='inputs'>
          <label htmlFor='password'>Password</label>
          <input
            id='password'
            type='password'
            value={formFields.password}
            onChange={e => setFormFields({ ...formFields, password: e.target.value })}
          />
        </div>
        
        { errorMessage ? (
          <div className='inputs'>
            <p className='error-text'>{errorMessage}</p>
          </div>          
        ) : null }

        <div className='buttons'>
          <button onClick={onLoginSubmit}>Login</button>
        </div>
      </div>
    </div>
  )
}

export default LoginForm;
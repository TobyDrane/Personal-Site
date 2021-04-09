import React from 'react';
import LoginForm from '../components/forms/LoginForm';
import Layout from '../components/Layout';

const Login = () => {
  return (
    <Layout>
      <main className="login-wrapper">
        <LoginForm />
      </main>
    </Layout>
  )
}

export default Login;
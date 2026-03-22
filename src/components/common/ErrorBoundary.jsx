import { Component } from 'react'
import Page500 from './Page500'

class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, isDarkTheme: props.isDarkTheme }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true }
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by ErrorBoundary:', error, errorInfo)
    // You can also log the error to an error reporting service here
  }

  render() {
    if (this.state.hasError) {
      return <Page500 isDarkTheme={this.props.isDarkTheme} />
    }

    return this.props.children
  }
}

export default ErrorBoundary

/*
 * Copyright 2025 pluslatte
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { Component, ReactNode, ErrorInfo } from 'react';
import { Alert, Button, Stack, Text, Code } from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
      errorInfo: null,
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.setState({
      error,
      errorInfo,
    });
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Stack
          align="center"
          justify="center"
          style={{ minHeight: '100vh', padding: '2rem' }}
        >
          <Alert
            icon={<IconAlertCircle size={24} />}
            title="予期しないエラーが発生しました"
            color="red"
            style={{ maxWidth: '600px', width: '100%' }}
          >
            <Stack gap="md">
              <Text>
                アプリケーションで予期しないエラーが発生しました。
                アプリを再起動してください。
              </Text>

              {this.state.error && (
                <Code block style={{ maxHeight: '200px', overflow: 'auto' }}>
                  {this.state.error.toString()}
                  {this.state.errorInfo && `\n\n${this.state.errorInfo.componentStack}`}
                </Code>
              )}

              <Button
                leftSection={<IconRefresh size={16} />}
                onClick={this.handleReload}
                color="blue"
              >
                アプリを再起動
              </Button>
            </Stack>
          </Alert>
        </Stack>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;

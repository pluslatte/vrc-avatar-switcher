/*
 * Copyright (C) 2025 pluslatte
 * This file is part of vrc-avatar-switcher.
 *
 * vrc-avatar-switcher is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
 *
 * vrc-avatar-switcher is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.
 * You should have received a copy of the GNU General Public License along with vrc-avatar-switcher. If not, see <https://www.gnu.org/licenses/>.
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

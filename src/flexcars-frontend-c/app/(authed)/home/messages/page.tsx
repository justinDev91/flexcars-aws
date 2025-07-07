'use client';

import { useState } from 'react';
import { 
  Container, 
  Title, 
  Card, 
  Text, 
  Button, 
  Group, 
  Stack, 
  TextInput,
  Textarea,
  Modal,
  Avatar,
  Badge,
  ActionIcon,
  Divider
} from '@mantine/core';
import { useAuthSession } from '@/app/auth/hooks/useAuthSession';
import { IconSend, IconMessage, IconUser, IconClock, IconMessageCircle } from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';

interface Message {
  id: string;
  from: string;
  to: string;
  subject: string;
  content: string;
  timestamp: string;
  read: boolean;
  type: 'support' | 'reservation' | 'general';
}

export default function Messages() {
  const { user } = useAuthSession();
  const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [newMessage, setNewMessage] = useState({
    subject: '',
    content: '',
    type: 'general' as const,
  });

  // Mock messages data
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      from: 'FlexCars Support',
      to: user?.email || '',
      subject: 'Welcome to FlexCars!',
      content: 'Thank you for joining FlexCars. We\'re excited to have you as a customer. If you have any questions about our service, feel free to reach out to us.',
      timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      read: false,
      type: 'general',
    },
    {
      id: '2',
      from: 'FlexCars Support',
      to: user?.email || '',
      subject: 'Reservation Confirmation',
      content: 'Your reservation for BMW 320i has been confirmed. Please check your email for the QR code and pick-up details.',
      timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
      read: true,
      type: 'reservation',
    },
    {
      id: '3',
      from: 'FlexCars Support',
      to: user?.email || '',
      subject: 'Upcoming Maintenance',
      content: 'One of our vehicles you frequently rent will undergo maintenance next week. Here are alternative options for your upcoming trips.',
      timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
      read: false,
      type: 'support',
    },
  ]);

  const getMessageTypeColor = (type: string) => {
    switch (type) {
      case 'support':
        return 'blue';
      case 'reservation':
        return 'green';
      case 'general':
        return 'gray';
      default:
        return 'gray';
    }
  };

  const getMessageTypeLabel = (type: string) => {
    switch (type) {
      case 'support':
        return 'Support';
      case 'reservation':
        return 'Reservation';
      case 'general':
        return 'General';
      default:
        return 'General';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      return 'Today';
    } else if (diffDays === 2) {
      return 'Yesterday';
    } else if (diffDays <= 7) {
      return `${diffDays - 1} days ago`;
    } else {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      });
    }
  };

  const handleMessageClick = (message: Message) => {
    setSelectedMessage(message);
    setIsModalOpen(true);
    
    // Mark as read
    if (!message.read) {
      setMessages(prev => prev.map(msg => 
        msg.id === message.id ? { ...msg, read: true } : msg
      ));
    }
  };

  const handleSendMessage = () => {
    if (!newMessage.subject || !newMessage.content) {
      notifications.show({
        title: 'Error',
        message: 'Please fill in all fields',
        color: 'red',
      });
      return;
    }

    const message: Message = {
      id: Date.now().toString(),
      from: user?.email || 'You',
      to: 'FlexCars Support',
      subject: newMessage.subject,
      content: newMessage.content,
      timestamp: new Date().toISOString(),
      read: true,
      type: newMessage.type,
    };

    setMessages(prev => [message, ...prev]);
    setNewMessage({ subject: '', content: '', type: 'general' });
    setIsComposeOpen(false);
    
    notifications.show({
      title: 'Success',
      message: 'Message sent successfully',
      color: 'green',
    });
  };

  const unreadCount = messages.filter(msg => !msg.read).length;

  return (
    <Container size="lg" py="xl">
      <Group justify="space-between" mb="xl">
        <div>
          <Title order={2} className="text-gray-800">
            Messages
          </Title>
          {unreadCount > 0 && (
            <Text size="sm" c="dimmed">
              {unreadCount} unread message{unreadCount > 1 ? 's' : ''}
            </Text>
          )}
        </div>
        <Button
          leftSection={<IconSend size={16} />}
          onClick={() => setIsComposeOpen(true)}
        >
          Compose Message
        </Button>
      </Group>

      {messages.length === 0 ? (
        <Card padding="xl" className="text-center">
          <IconMessage size={48} className="mx-auto mb-4 text-gray-400" />
          <Title order={3} className="text-gray-600 mb-2">
            No messages yet
          </Title>
          <Text className="text-gray-500 mb-4">
            You'll see all your messages and communications with FlexCars here.
          </Text>
          <Button onClick={() => setIsComposeOpen(true)}>
            Send Your First Message
          </Button>
        </Card>
      ) : (
        <Stack gap="xs">
          {messages.map((message) => (
            <Card
              key={message.id}
              padding="md"
              withBorder
              className={`cursor-pointer transition-colors ${
                !message.read ? 'bg-blue-50 border-blue-200' : 'hover:bg-gray-50'
              }`}
              onClick={() => handleMessageClick(message)}
            >
              <Group justify="space-between">
                <div className="flex-1">
                  <Group gap="sm" mb="xs">
                    <Avatar size="sm" radius="xl">
                      <IconUser size={16} />
                    </Avatar>
                    <div>
                      <Text fw={500} size="sm">
                        {message.from}
                      </Text>
                      <Group gap="xs">
                        <Badge
                          color={getMessageTypeColor(message.type)}
                          variant="light"
                          size="xs"
                        >
                          {getMessageTypeLabel(message.type)}
                        </Badge>
                        <Text size="xs" c="dimmed">
                          {formatDate(message.timestamp)}
                        </Text>
                      </Group>
                    </div>
                  </Group>
                  
                  <Text fw={message.read ? 400 : 600} mb="xs">
                    {message.subject}
                  </Text>
                  
                  <Text size="sm" c="dimmed" lineClamp={2}>
                    {message.content}
                  </Text>
                </div>
                
                <div className="flex flex-col items-end">
                  {!message.read && (
                    <div className="w-3 h-3 bg-blue-500 rounded-full mb-2"></div>
                  )}
                  <ActionIcon variant="subtle" size="sm">
                    <IconMessageCircle size={16} />
                  </ActionIcon>
                </div>
              </Group>
            </Card>
          ))}
        </Stack>
      )}

      {/* Message Detail Modal */}
      <Modal
        opened={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={selectedMessage?.subject}
        size="lg"
      >
        {selectedMessage && (
          <Stack gap="md">
            <Group justify="space-between">
              <Group gap="sm">
                <Avatar size="sm" radius="xl">
                  <IconUser size={16} />
                </Avatar>
                <div>
                  <Text fw={500} size="sm">
                    {selectedMessage.from}
                  </Text>
                  <Text size="xs" c="dimmed">
                    {formatDate(selectedMessage.timestamp)}
                  </Text>
                </div>
              </Group>
              
              <Badge
                color={getMessageTypeColor(selectedMessage.type)}
                variant="light"
              >
                {getMessageTypeLabel(selectedMessage.type)}
              </Badge>
            </Group>
            
            <Divider />
            
            <Text style={{ whiteSpace: 'pre-wrap' }}>
              {selectedMessage.content}
            </Text>
            
            <Group justify="flex-end" mt="md">
              <Button
                variant="outline"
                onClick={() => setIsModalOpen(false)}
              >
                Close
              </Button>
              <Button
                leftSection={<IconSend size={16} />}
                onClick={() => {
                  setIsModalOpen(false);
                  setIsComposeOpen(true);
                  setNewMessage(prev => ({
                    ...prev,
                    subject: `Re: ${selectedMessage.subject}`,
                  }));
                }}
              >
                Reply
              </Button>
            </Group>
          </Stack>
        )}
      </Modal>

      {/* Compose Message Modal */}
      <Modal
        opened={isComposeOpen}
        onClose={() => setIsComposeOpen(false)}
        title="Compose Message"
        size="lg"
      >
        <Stack gap="md">
          <Group grow>
            <TextInput
              label="Subject"
              placeholder="Enter message subject"
              value={newMessage.subject}
              onChange={(event) => setNewMessage(prev => ({
                ...prev,
                subject: event.currentTarget.value
              }))}
              required
            />
          </Group>
          
          <Textarea
            label="Message"
            placeholder="Write your message here..."
            value={newMessage.content}
            onChange={(event) => setNewMessage(prev => ({
              ...prev,
              content: event.currentTarget.value
            }))}
            minRows={6}
            required
          />
          
          <Group justify="flex-end">
            <Button
              variant="outline"
              onClick={() => setIsComposeOpen(false)}
            >
              Cancel
            </Button>
            <Button
              leftSection={<IconSend size={16} />}
              onClick={handleSendMessage}
            >
              Send Message
            </Button>
          </Group>
        </Stack>
      </Modal>
    </Container>
  );
}

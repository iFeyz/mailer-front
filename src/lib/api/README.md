# Mailer API Client

A TypeScript client for the Mailer API.

## Installation

```bash
npm install @your-org/mailer-api-client
```

## Usage

First, create an instance of the API client:

```typescript
import { MailerApi } from '@your-org/mailer-api-client';

const api = new MailerApi({
  baseURL: 'http://localhost:8080',
  apiKey: 'your-api-key',
  timeout: 5000, // optional, defaults to 10000ms
});
```

### Working with Subscribers

```typescript
// Create a subscriber
const newSubscriber = await api.subscribers.createSubscriber({
  email: 'user@example.com',
  name: 'John Doe',
  attribs: { country: 'US' }
});

// Get a subscriber by ID or email
const subscriber = await api.subscribers.getSubscriber('user@example.com');
// or
const subscriber = await api.subscribers.getSubscriber(1);

// List subscribers with pagination and filters
const subscribers = await api.subscribers.getSubscribers({
  page: 1,
  per_page: 10,
  order_by: 'created_at',
  order: 'DESC',
  query: 'john',
  subscriber_status: 'enabled'
});

// Update a subscriber
const updatedSubscriber = await api.subscribers.updateSubscriber('user@example.com', {
  name: 'John Smith',
  status: 'disabled'
});

// Delete a subscriber
await api.subscribers.deleteSubscriber('user@example.com');
```

### Working with Lists

```typescript
// Create a list
const newList = await api.lists.createList({
  name: 'Newsletter',
  type: 'public',
  optin: 'double',
  tags: ['news', 'updates'],
  description: 'Our newsletter list'
});

// Get a list
const list = await api.lists.getList(1);

// List all lists with filters
const lists = await api.lists.getLists({
  page: 1,
  per_page: 10,
  type: ['public'],
  tags: ['news']
});

// Delete a list
await api.lists.deleteList(1);
```

### Working with Templates

```typescript
// Create a template
const newTemplate = await api.templates.createTemplate({
  name: 'Welcome Email',
  template_type: 'campaign',
  subject: 'Welcome to our service',
  body: 'Hello {{name}}, welcome to our service!',
  is_default: false
});

// Get a template
const template = await api.templates.getTemplate(1);

// List templates
const templates = await api.templates.getTemplates({
  query: 'welcome',
  page: 1,
  per_page: 10
});

// Update a template
const updatedTemplate = await api.templates.updateTemplate(1, {
  subject: 'Updated subject'
});

// Delete a template
await api.templates.deleteTemplate(1);
```

### Working with Subscriber Lists

```typescript
// Subscribe a user to a list
const subscription = await api.subscriberLists.createSubscriberList({
  subscriber_id: 1,
  list_id: 1,
  status: 'unconfirmed',
  meta: { source: 'website' }
});

// Get a subscription
const subscriberList = await api.subscriberLists.getSubscriberList(1, 1);

// List subscriptions
const subscriptions = await api.subscriberLists.getSubscriberLists({
  subscriber_id: 1,
  status: 'confirmed'
});

// Update a subscription
const updatedSubscription = await api.subscriberLists.updateSubscriberList(1, 1, {
  status: 'confirmed'
});

// Remove a subscription
await api.subscriberLists.deleteSubscriberList(1, 1);
```

## Error Handling

The API client throws errors for various scenarios:

```typescript
try {
  await api.subscribers.getSubscriber('nonexistent@email.com');
} catch (error) {
  if (error.message.includes('not found')) {
    console.log('Subscriber not found');
  } else if (error.message.includes('Unauthorized')) {
    console.log('Invalid API key');
  } else {
    console.log('An error occurred:', error.message);
  }
}
```

## Types

The client includes TypeScript definitions for all API types. You can import them directly:

```typescript
import {
  Subscriber,
  CreateSubscriberDto,
  List,
  Template,
  SubscriberList,
  SubscriberStatus,
  ListType,
  TemplateType,
  SubscriptionStatus
} from '@your-org/mailer-api-client';
``` 
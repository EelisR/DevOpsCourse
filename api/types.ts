export type QueueResponse = {
  filtered_count?: number;
  item_count?: number;
  items?: Item[];
  page?: number;
  page_count?: number;
  page_size?: number;
  total_count?: number;
};

export type Item = {
  arguments?: Arguments;
  auto_delete?: boolean;
  consumer_capacity?: number;
  consumer_utilisation?: number;
  consumers?: number;
  durable?: boolean;
  effective_policy_definition?: Arguments;
  exclusive?: boolean;
  exclusive_consumer_tag?: null;
  garbage_collection?: GarbageCollection;
  head_message_timestamp?: null;
  memory?: number;
  message_bytes?: number;
  message_bytes_paged_out?: number;
  message_bytes_persistent?: number;
  message_bytes_ram?: number;
  message_bytes_ready?: number;
  message_bytes_unacknowledged?: number;
  message_stats?: MessageStats;
  messages?: number;
  messages_details?: Details;
  messages_paged_out?: number;
  messages_persistent?: number;
  messages_ram?: number;
  messages_ready?: number;
  messages_ready_details?: Details;
  messages_ready_ram?: number;
  messages_unacknowledged?: number;
  messages_unacknowledged_details?: Details;
  messages_unacknowledged_ram?: number;
  name?: string;
  node?: string;
  operator_policy?: null;
  policy?: null;
  recoverable_slaves?: null;
  reductions?: number;
  reductions_details?: Details;
  single_active_consumer_tag?: null;
  state?: string;
  type?: string;
  vhost?: string;
};

export type Arguments = {};

export type GarbageCollection = {
  fullsweep_after?: number;
  max_heap_size?: number;
  min_bin_vheap_size?: number;
  min_heap_size?: number;
  minor_gcs?: number;
};

export type MessageStats = {
  ack?: number;
  ack_details?: Details;
  deliver?: number;
  deliver_details?: Details;
  deliver_get?: number;
  deliver_get_details?: Details;
  deliver_no_ack?: number;
  deliver_no_ack_details?: Details;
  get?: number;
  get_details?: Details;
  get_empty?: number;
  get_empty_details?: Details;
  get_no_ack?: number;
  get_no_ack_details?: Details;
  publish?: number;
  publish_details?: Details;
  redeliver?: number;
  redeliver_details?: Details;
};

export type Details = {
  rate?: number;
};
export type OverviewResponse = {
  management_version?: string;
  rates_mode?: string;
  sample_retention_policies?: SampleRetentionPolicies;
  exchange_types?: ExchangeType[];
  product_version?: string;
  product_name?: string;
  rabbitmq_version?: string;
  cluster_name?: string;
  erlang_version?: string;
  erlang_full_version?: string;
  release_series_support_status?: string;
  disable_stats?: boolean;
  is_op_policy_updating_enabled?: boolean;
  enable_queue_totals?: boolean;
  message_stats?: MessageStats;
  churn_rates?: ChurnRates;
  queue_totals?: QueueTotals;
  object_totals?: ObjectTotals;
  statistics_db_event_queue?: number;
  node?: string;
  listeners?: Listener[];
  contexts?: Context[];
};

export type ChurnRates = {
  channel_closed?: number;
  channel_closed_details?: Details;
  channel_created?: number;
  channel_created_details?: Details;
  connection_closed?: number;
  connection_closed_details?: Details;
  connection_created?: number;
  connection_created_details?: Details;
  queue_created?: number;
  queue_created_details?: Details;
  queue_declared?: number;
  queue_declared_details?: Details;
  queue_deleted?: number;
  queue_deleted_details?: Details;
};

export type Context = {
  ssl_opts?: any[];
  node?: string;
  description?: string;
  path?: string;
  cowboy_opts?: string;
  port?: string;
  protocol?: string;
};

export type ExchangeType = {
  name?: string;
  description?: string;
  enabled?: boolean;
};

export type Listener = {
  node?: string;
  protocol?: string;
  ip_address?: string;
  port?: number;
  socket_opts?: any[] | SocketOptsClass;
};

export type SocketOptsClass = {
  backlog?: number;
  nodelay?: boolean;
  linger?: Array<boolean | number>;
  exit_on_close?: boolean;
  cowboy_opts?: CowboyOpts;
  port?: number;
  protocol?: string;
};

export type CowboyOpts = {
  sendfile?: boolean;
};

export type ObjectTotals = {
  channels?: number;
  connections?: number;
  consumers?: number;
  exchanges?: number;
  queues?: number;
};

export type QueueTotals = {
  messages?: number;
  messages_details?: Details;
  messages_ready?: number;
  messages_ready_details?: Details;
  messages_unacknowledged?: number;
  messages_unacknowledged_details?: Details;
};

export type SampleRetentionPolicies = {
  global?: number[];
  basic?: number[];
  detailed?: number[];
};

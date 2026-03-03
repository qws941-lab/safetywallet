CREATE INDEX `site_memberships_user_idx` ON `site_memberships` (`user_id`);
CREATE INDEX `actions_assignee_idx` ON `actions` (`assignee_id`);
CREATE INDEX `actions_status_idx` ON `actions` (`action_status`);

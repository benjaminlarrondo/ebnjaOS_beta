-- Replace with your real user uuid after auth signup
-- \set user_id '00000000-0000-0000-0000-000000000000'

insert into projects (user_id, title, description, status, priority) values
('00000000-0000-0000-0000-000000000000', 'ebnjaOS Core', 'MVP personal OS', 'active', 'high');

insert into tasks (user_id, title, status, priority) values
('00000000-0000-0000-0000-000000000000', 'Definir foco semanal', 'today', 'high');

insert into notes (user_id, title, content, type) values
('00000000-0000-0000-0000-000000000000', 'Nota inicial', 'Bienvenido a ebnjaOS', 'quick');

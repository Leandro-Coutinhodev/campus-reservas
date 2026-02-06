-- ============================================================
-- SCHEMA DO BANCO DE DADOS - Sistema de Reserva de Espaços
-- Campus Cametá
-- ============================================================

-- Criação do schema
CREATE SCHEMA IF NOT EXISTS reservas;
SET search_path TO reservas;

-- ============================================================
-- Tabela: espacos_fisicos
-- Descrição: Armazena informações sobre os espaços disponíveis
-- ============================================================
CREATE TABLE espacos_fisicos (
    id SERIAL PRIMARY KEY,
    codigo VARCHAR(50) UNIQUE NOT NULL,
    nome VARCHAR(200) NOT NULL,
    descricao TEXT,
    capacidade INTEGER NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- sala, auditorio, laboratorio, quadra, biblioteca
    localizacao VARCHAR(200),
    recursos TEXT[], -- projetor, ar-condicionado, computadores, etc.
    google_calendar_id VARCHAR(200) UNIQUE, -- ID do calendário no Google Calendar
    ativo BOOLEAN DEFAULT TRUE,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabela: reservas
-- Descrição: Registro de todas as reservas realizadas
-- ============================================================
CREATE TABLE reservas (
    id SERIAL PRIMARY KEY,
    espaco_id INTEGER NOT NULL REFERENCES espacos_fisicos(id),
    solicitante_nome VARCHAR(200) NOT NULL,
    solicitante_email VARCHAR(200) NOT NULL,
    finalidade TEXT,
    
    -- Informações de data e hora
    data_reserva DATE NOT NULL,
    hora_inicio TIME NOT NULL,
    hora_fim TIME NOT NULL,
    
    -- Controle de status
    status VARCHAR(50) DEFAULT 'pendente', -- pendente, confirmada, cancelada, rejeitada
    
    -- IDs de integração externa
    google_calendar_event_id VARCHAR(200), -- ID do evento no Google Calendar
    
    -- Metadata
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    cancelado_em TIMESTAMP,
    motivo_cancelamento TEXT,
    
    -- Constraints
    CONSTRAINT check_horario CHECK (hora_fim > hora_inicio),
    CONSTRAINT check_status CHECK (status IN ('pendente', 'confirmada', 'cancelada', 'rejeitada'))
);

-- ============================================================
-- Tabela: historico_alteracoes
-- Descrição: Log de todas as alterações em reservas
-- ============================================================
CREATE TABLE historico_alteracoes (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER NOT NULL REFERENCES reservas(id),
    tipo_alteracao VARCHAR(50) NOT NULL, -- criacao, modificacao, cancelamento
    usuario VARCHAR(200),
    descricao TEXT,
    dados_anteriores JSONB, -- Snapshot do estado anterior
    dados_novos JSONB, -- Snapshot do novo estado
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabela: notificacoes
-- Descrição: Registro de notificações enviadas
-- ============================================================
CREATE TABLE notificacoes (
    id SERIAL PRIMARY KEY,
    reserva_id INTEGER REFERENCES reservas(id),
    destinatario_email VARCHAR(200) NOT NULL,
    tipo VARCHAR(50) NOT NULL, -- confirmacao, lembrete, cancelamento, alteracao
    assunto VARCHAR(300),
    corpo TEXT,
    enviado BOOLEAN DEFAULT FALSE,
    enviado_em TIMESTAMP,
    erro TEXT,
    criado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- Tabela: configuracoes
-- Descrição: Configurações gerais do sistema
-- ============================================================
CREATE TABLE configuracoes (
    chave VARCHAR(100) PRIMARY KEY,
    valor TEXT NOT NULL,
    descricao TEXT,
    atualizado_em TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================
-- ÍNDICES para otimização de consultas
-- ============================================================

-- Índices para busca de disponibilidade
CREATE INDEX idx_reservas_espaco_data ON reservas(espaco_id, data_reserva);
CREATE INDEX idx_reservas_status ON reservas(status);
CREATE INDEX idx_reservas_data_hora ON reservas(data_reserva, hora_inicio, hora_fim);

-- Índices para busca por solicitante
CREATE INDEX idx_reservas_email ON reservas(solicitante_email);

-- Índices para histórico
CREATE INDEX idx_historico_reserva ON historico_alteracoes(reserva_id);
CREATE INDEX idx_historico_data ON historico_alteracoes(criado_em);

-- Índices para notificações
CREATE INDEX idx_notificacoes_reserva ON notificacoes(reserva_id);
CREATE INDEX idx_notificacoes_nao_enviadas ON notificacoes(enviado) WHERE enviado = FALSE;

-- ============================================================
-- VIEWS úteis
-- ============================================================

-- View: Reservas Ativas
CREATE VIEW vw_reservas_ativas AS
SELECT 
    r.id,
    r.espaco_id,
    e.nome as espaco_nome,
    e.codigo as espaco_codigo,
    r.solicitante_nome,
    r.solicitante_email,
    r.data_reserva,
    r.hora_inicio,
    r.hora_fim,
    r.finalidade,
    r.status,
    r.criado_em
FROM reservas r
INNER JOIN espacos_fisicos e ON r.espaco_id = e.id
WHERE r.status IN ('pendente', 'confirmada')
    AND r.data_reserva >= CURRENT_DATE
ORDER BY r.data_reserva, r.hora_inicio;

-- View: Disponibilidade de Espaços
CREATE VIEW vw_proximas_reservas AS
SELECT 
    e.id as espaco_id,
    e.nome as espaco_nome,
    e.capacidade,
    COUNT(r.id) as total_reservas_futuras,
    MIN(r.data_reserva) as proxima_reserva
FROM espacos_fisicos e
LEFT JOIN reservas r ON e.id = r.espaco_id 
    AND r.status = 'confirmada'
    AND r.data_reserva >= CURRENT_DATE
WHERE e.ativo = TRUE
GROUP BY e.id, e.nome, e.capacidade;

-- ============================================================
-- FUNÇÕES ÚTEIS
-- ============================================================

-- Função: Verificar conflito de horário
CREATE OR REPLACE FUNCTION verificar_conflito_horario(
    p_espaco_id INTEGER,
    p_data DATE,
    p_hora_inicio TIME,
    p_hora_fim TIME,
    p_reserva_id INTEGER DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
    v_count INTEGER;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM reservas
    WHERE espaco_id = p_espaco_id
        AND data_reserva = p_data
        AND status IN ('pendente', 'confirmada')
        AND (id != p_reserva_id OR p_reserva_id IS NULL)
        AND (
            -- Verifica sobreposição de horários
            (hora_inicio < p_hora_fim AND hora_fim > p_hora_inicio)
        );
    
    RETURN v_count > 0;
END;
$$ LANGUAGE plpgsql;

-- Função: Atualizar timestamp de atualização
CREATE OR REPLACE FUNCTION atualizar_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.atualizado_em = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ============================================================
-- TRIGGERS
-- ============================================================

-- Trigger: Atualizar timestamp em espacos_fisicos
CREATE TRIGGER trigger_espacos_atualizar_timestamp
    BEFORE UPDATE ON espacos_fisicos
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Trigger: Atualizar timestamp em reservas
CREATE TRIGGER trigger_reservas_atualizar_timestamp
    BEFORE UPDATE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION atualizar_timestamp();

-- Trigger: Registrar alterações no histórico
CREATE OR REPLACE FUNCTION registrar_historico_reserva()
RETURNS TRIGGER AS $$
BEGIN
    IF (TG_OP = 'INSERT') THEN
        INSERT INTO historico_alteracoes (
            reserva_id,
            tipo_alteracao,
            descricao,
            dados_novos
        ) VALUES (
            NEW.id,
            'criacao',
            'Nova reserva criada',
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'UPDATE') THEN
        INSERT INTO historico_alteracoes (
            reserva_id,
            tipo_alteracao,
            descricao,
            dados_anteriores,
            dados_novos
        ) VALUES (
            NEW.id,
            'modificacao',
            'Reserva modificada',
            row_to_json(OLD),
            row_to_json(NEW)
        );
        RETURN NEW;
    ELSIF (TG_OP = 'DELETE') THEN
        INSERT INTO historico_alteracoes (
            reserva_id,
            tipo_alteracao,
            descricao,
            dados_anteriores
        ) VALUES (
            OLD.id,
            'exclusao',
            'Reserva excluída',
            row_to_json(OLD)
        );
        RETURN OLD;
    END IF;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_historico_reservas
    AFTER INSERT OR UPDATE OR DELETE ON reservas
    FOR EACH ROW
    EXECUTE FUNCTION registrar_historico_reserva();

-- ============================================================
-- DADOS INICIAIS
-- ============================================================

-- Inserir espaços físicos do Campus Cametá
INSERT INTO espacos_fisicos (codigo, nome, descricao, capacidade, tipo, localizacao, recursos, google_calendar_id) VALUES
-- PRÉDIO ORLANDO CASSIQUE - TÉRREO
('ORL-T-S01', 'SALA 01 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-terreo-s01@group.calendar.google.com'),
('ORL-T-S02', 'SALA 02 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-terreo-s02@group.calendar.google.com'),
('ORL-T-S03', 'SALA 03 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-terreo-s03@group.calendar.google.com'),

-- PRÉDIO ORLANDO CASSIQUE - 1º ANDAR
('ORL-1A-S01', 'SALA 01 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-1andar-s01@group.calendar.google.com'),
('ORL-1A-S02', 'SALA 02 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-1andar-s02@group.calendar.google.com'),
('ORL-1A-S03', 'SALA 03 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-1andar-s03@group.calendar.google.com'),
('ORL-1A-S04', 'SALA 04 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-1andar-s04@group.calendar.google.com'),

-- PRÉDIO ORLANDO CASSIQUE - 2º ANDAR
('ORL-2A-S05', 'SALA 05 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-2andar-s05@group.calendar.google.com'),
('ORL-2A-S06', 'SALA 06 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-2andar-s06@group.calendar.google.com'),
('ORL-2A-S07', 'SALA 07 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-2andar-s07@group.calendar.google.com'),
('ORL-2A-S08', 'SALA 08 - ORLANDO CASSIQUE', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'orlando-2andar-s08@group.calendar.google.com'),

-- PRÉDIO MARIA CORDEIRO - TÉRREO
('MAR-T-S01', 'SALA 01 - MARIA CORDEIRO', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO MARIA CORDEIRO - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'maria-terreo-s01@group.calendar.google.com'),
('MAR-T-S02', 'SALA 02 - MARIA CORDEIRO', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO MARIA CORDEIRO - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'maria-terreo-s02@group.calendar.google.com'),
('MAR-T-S03', 'SALA 03 - MARIA CORDEIRO', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO MARIA CORDEIRO - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'maria-terreo-s03@group.calendar.google.com'),

-- PRÉDIO CARLOS AMORIM - TÉRREO
('CAR-T-S01', 'SALA 01 - CARLOS AMORIM', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO CARLOS AMORIM - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'carlos-terreo-s01@group.calendar.google.com'),
('CAR-T-S02', 'SALA 02 - CARLOS AMORIM', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO CARLOS AMORIM - TÉRREO', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'carlos-terreo-s02@group.calendar.google.com'),

-- PRÉDIO CARLOS AMORIM - 1º ANDAR
('CAR-1A-S03', 'SALA 03 - CARLOS AMORIM', 'Sala de aula padrão', 40, 'sala', 'PRÉDIO CARLOS AMORIM - 1º ANDAR', ARRAY['quadro-branco', 'projetor', 'ar-condicionado'], 'carlos-1andar-s03@group.calendar.google.com');

-- Inserir configurações iniciais
INSERT INTO configuracoes (chave, valor, descricao) VALUES
('horario_funcionamento_inicio', '07:00', 'Horário de início do funcionamento'),
('horario_funcionamento_fim', '22:00', 'Horário de término do funcionamento'),
('antecedencia_minima_horas', '24', 'Antecedência mínima em horas para reserva'),
('duracao_maxima_horas', '8', 'Duração máxima de uma reserva em horas'),
('email_notificacao_admin', 'admin@campus.br', 'Email do administrador para notificações'),
('n8n_webhook_url', 'https://seu-n8n.com/webhook/reserva', 'URL do webhook N8N');

-- ============================================================
-- CONSULTAS ÚTEIS PARA TESTES
-- ============================================================

-- Verificar espaços disponíveis em uma data/hora específica
-- SELECT * FROM espacos_fisicos e
-- WHERE e.ativo = TRUE
--   AND NOT verificar_conflito_horario(e.id, '2024-03-15', '14:00', '16:00');

-- Listar todas as reservas de um espaço
-- SELECT * FROM vw_reservas_ativas WHERE espaco_codigo = 'SALA-101';

-- Ver histórico de alterações de uma reserva
-- SELECT * FROM historico_alteracoes WHERE reserva_id = 1 ORDER BY criado_em DESC;

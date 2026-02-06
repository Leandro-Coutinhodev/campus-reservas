-- ============================================
-- SCRIPT PARA ATUALIZAR CALENDAR IDs
-- Campus Cametá - Salas Reais
-- ============================================

-- INSTRUÇÕES:
-- 1. Crie todos os 18 calendários no Google Calendar
-- 2. Copie o Calendar ID de cada um (em Settings → Integrate calendar)
-- 3. Substitua 'SEU_CALENDAR_ID_AQUI' pelos IDs reais
-- 4. Execute este script no PostgreSQL

-- ============================================
-- PRÉDIO ORLANDO CASSIQUE - TÉRREO
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-T-S01';
-- Exemplo: 'c_1a2b3c4d5e6f@group.calendar.google.com'

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-T-S02';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-T-S03';

-- ============================================
-- PRÉDIO ORLANDO CASSIQUE - 1º ANDAR
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-1A-S01';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-1A-S02';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-1A-S03';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-1A-S04';

-- ============================================
-- PRÉDIO ORLANDO CASSIQUE - 2º ANDAR
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-2A-S05';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-2A-S06';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-2A-S07';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'ORL-2A-S08';

-- ============================================
-- PRÉDIO MARIA CORDEIRO - TÉRREO
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'MAR-T-S01';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'MAR-T-S02';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'MAR-T-S03';

-- ============================================
-- PRÉDIO CARLOS AMORIM - TÉRREO
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'CAR-T-S01';

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'CAR-T-S02';

-- ============================================
-- PRÉDIO CARLOS AMORIM - 1º ANDAR
-- ============================================

UPDATE reservas.espacos_fisicos 
SET google_calendar_id = 'SEU_CALENDAR_ID_AQUI'
WHERE codigo = 'CAR-1A-S03';

-- ============================================
-- VERIFICAR ATUALIZAÇÃO
-- ============================================

-- Execute esta query para verificar se todos os IDs foram atualizados:
SELECT 
  codigo,
  nome,
  localizacao,
  google_calendar_id,
  CASE 
    WHEN google_calendar_id LIKE '%@group.calendar.google.com' THEN '✅ Configurado'
    ELSE '❌ Não configurado'
  END as status
FROM reservas.espacos_fisicos
ORDER BY localizacao, codigo;

-- Todos devem aparecer como "✅ Configurado"

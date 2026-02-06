import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin, User, Mail, CheckCircle, XCircle, Loader, AlertCircle, Info } from 'lucide-react';
import './App.css';

function App() {
  const [spaces, setSpaces] = useState([]);
  const [selectedSpace, setSelectedSpace] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [requesterName, setRequesterName] = useState('');
  const [requesterEmail, setRequesterEmail] = useState('');
  const [purpose, setPurpose] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [availability, setAvailability] = useState(null);
  const [checkingAvailability, setCheckingAvailability] = useState(false);

  // Configurações - ALTERE ESTAS URLs APÓS IMPORTAR OS WORKFLOWS NO N8N
  const N8N_BASE_URL = process.env.REACT_APP_N8N_URL || 'http://localhost:5678';
  const WEBHOOK_CHECK_AVAILABILITY = `${N8N_BASE_URL}/webhook/check-availability`;
  const WEBHOOK_CREATE_RESERVATION = `${N8N_BASE_URL}/webhook/create-reservation`;

  useEffect(() => {
    loadSpaces();
  }, []);

  const loadSpaces = () => {
    // Espaços disponíveis do Campus Cametá - sincronize com o banco de dados
    const campusSpaces = [
      // PRÉDIO ORLANDO CASSIQUE - TÉRREO
      { 
        id: 'ORL-T-S01', 
        name: 'SALA 01 - ORLANDO CASSIQUE (Térreo)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: '7866bb5ebef7871f4a3bb596f621112fcb861e37c092b40746c945b47274fbed@group.calendar.google.com'
      },
      { 
        id: 'ORL-T-S02', 
        name: 'SALA 02 - ORLANDO CASSIQUE (Térreo)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: 'orlando-terreo-s02@group.calendar.google.com'
      },
      { 
        id: 'ORL-T-S03', 
        name: 'SALA 03 - ORLANDO CASSIQUE (Térreo)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - TÉRREO',
        calendarId: 'orlando-terreo-s03@group.calendar.google.com'
      },
      
      // PRÉDIO ORLANDO CASSIQUE - 1º ANDAR
      { 
        id: 'ORL-1A-S01', 
        name: 'SALA 01 - ORLANDO CASSIQUE (1º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s01@group.calendar.google.com'
      },
      { 
        id: 'ORL-1A-S02', 
        name: 'SALA 02 - ORLANDO CASSIQUE (1º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s02@group.calendar.google.com'
      },
      { 
        id: 'ORL-1A-S03', 
        name: 'SALA 03 - ORLANDO CASSIQUE (1º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s03@group.calendar.google.com'
      },
      { 
        id: 'ORL-1A-S04', 
        name: 'SALA 04 - ORLANDO CASSIQUE (1º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR',
        calendarId: 'orlando-1andar-s04@group.calendar.google.com'
      },
      
      // PRÉDIO ORLANDO CASSIQUE - 2º ANDAR
      { 
        id: 'ORL-2A-S05', 
        name: 'SALA 05 - ORLANDO CASSIQUE (2º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s05@group.calendar.google.com'
      },
      { 
        id: 'ORL-2A-S06', 
        name: 'SALA 06 - ORLANDO CASSIQUE (2º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s06@group.calendar.google.com'
      },
      { 
        id: 'ORL-2A-S07', 
        name: 'SALA 07 - ORLANDO CASSIQUE (2º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s07@group.calendar.google.com'
      },
      { 
        id: 'ORL-2A-S08', 
        name: 'SALA 08 - ORLANDO CASSIQUE (2º Andar)', 
        capacity: 40,
        location: 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR',
        calendarId: 'orlando-2andar-s08@group.calendar.google.com'
      },
      
      // PRÉDIO MARIA CORDEIRO - TÉRREO
      { 
        id: 'MAR-T-S01', 
        name: 'SALA 01 - MARIA CORDEIRO', 
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s01@group.calendar.google.com'
      },
      { 
        id: 'MAR-T-S02', 
        name: 'SALA 02 - MARIA CORDEIRO', 
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s02@group.calendar.google.com'
      },
      { 
        id: 'MAR-T-S03', 
        name: 'SALA 03 - MARIA CORDEIRO', 
        capacity: 40,
        location: 'PRÉDIO MARIA CORDEIRO - TÉRREO',
        calendarId: 'maria-terreo-s03@group.calendar.google.com'
      },
      
      // PRÉDIO CARLOS AMORIM - TÉRREO
      { 
        id: 'CAR-T-S01', 
        name: 'SALA 01 - CARLOS AMORIM (Térreo)', 
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - TÉRREO',
        calendarId: 'carlos-terreo-s01@group.calendar.google.com'
      },
      { 
        id: 'CAR-T-S02', 
        name: 'SALA 02 - CARLOS AMORIM (Térreo)', 
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - TÉRREO',
        calendarId: 'carlos-terreo-s02@group.calendar.google.com'
      },
      
      // PRÉDIO CARLOS AMORIM - 1º ANDAR
      { 
        id: 'CAR-1A-S03', 
        name: 'SALA 03 - CARLOS AMORIM (1º Andar)', 
        capacity: 40,
        location: 'PRÉDIO CARLOS AMORIM - 1º ANDAR',
        calendarId: 'carlos-1andar-s03@group.calendar.google.com'
      }
    ];
    setSpaces(campusSpaces);
  };

  const checkAvailability = async () => {
    if (!selectedSpace || !date || !startTime || !endTime) {
      setMessage({ 
        type: 'error', 
        text: 'Preencha espaço, data e horários para verificar disponibilidade' 
      });
      return;
    }

    // Validar se horário de término é posterior ao início
    if (endTime <= startTime) {
      setMessage({ 
        type: 'error', 
        text: 'O horário de término deve ser posterior ao horário de início' 
      });
      return;
    }

    setCheckingAvailability(true);
    setAvailability(null);
    setMessage({ type: '', text: '' });

    try {
      const selectedSpaceData = spaces.find(s => s.id === selectedSpace);
      
      const response = await fetch(WEBHOOK_CHECK_AVAILABILITY, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          spaceId: selectedSpace,
          calendarId: selectedSpaceData.calendarId,
          date,
          startTime,
          endTime
        })
      });

      const data = await response.json();
      
      setAvailability(data.available);
      
      if (data.available) {
        setMessage({ 
          type: 'success', 
          text: '✅ Espaço disponível no horário solicitado!' 
        });
      } else {
        setMessage({ 
          type: 'error', 
          text: `❌ Espaço indisponível. ${data.conflictingEvents ? `Há ${data.conflictingEvents} evento(s) neste horário.` : 'Escolha outro horário.'}` 
        });
      }
    } catch (error) {
      console.error('Erro ao verificar disponibilidade:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao verificar disponibilidade. Verifique se o N8N está rodando.' 
      });
      setAvailability(null);
    } finally {
      setCheckingAvailability(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedSpace || !date || !startTime || !endTime || !requesterName || !requesterEmail) {
      setMessage({ 
        type: 'error', 
        text: 'Por favor, preencha todos os campos obrigatórios' 
      });
      return;
    }

    if (availability !== true) {
      setMessage({ 
        type: 'error', 
        text: 'Por favor, verifique a disponibilidade antes de confirmar a reserva' 
      });
      return;
    }

    setLoading(true);
    setMessage({ type: '', text: '' });

    try {
      const selectedSpaceData = spaces.find(s => s.id === selectedSpace);
      
      const reservationData = {
        spaceId: selectedSpace,
        spaceName: selectedSpaceData.name,
        calendarId: selectedSpaceData.calendarId,
        capacity: selectedSpaceData.capacity,
        date,
        startTime,
        endTime,
        requesterName,
        requesterEmail,
        purpose: purpose || 'Não informado',
        timestamp: new Date().toISOString()
      };

      const response = await fetch(WEBHOOK_CREATE_RESERVATION, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reservationData)
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setMessage({ 
          type: 'success', 
          text: `🎉 Reserva confirmada com sucesso! Código: #${result.reservationId}. Você receberá um e-mail de confirmação.` 
        });
        
        // Limpar formulário
        resetForm();
      } else {
        throw new Error(result.message || 'Erro ao processar reserva');
      }
    } catch (error) {
      console.error('Erro ao enviar reserva:', error);
      setMessage({ 
        type: 'error', 
        text: 'Erro ao processar sua reserva. Tente novamente ou contate o suporte.' 
      });
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setSelectedSpace('');
    setDate('');
    setStartTime('');
    setEndTime('');
    setRequesterName('');
    setRequesterEmail('');
    setPurpose('');
    setAvailability(null);
  };

  const getMinDate = () => {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toISOString().split('T')[0];
  };

  return (
    <div className="app-container">
      {/* Header */}
      <header className="header">
        <div className="header-content">
          <div className="badge">SISTEMA DE RESERVAS</div>
          <h1 className="title">Campus Cametá</h1>
          <p className="subtitle">Reserve espaços físicos de forma rápida e inteligente</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="main-content">
        <div className="form-container">
          
          {/* Status Messages */}
          {message.text && (
            <div className={`alert alert-${message.type}`}>
              {message.type === 'success' ? <CheckCircle size={24} /> : 
               message.type === 'error' ? <XCircle size={24} /> : 
               <Info size={24} />}
              <span>{message.text}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="form">
            
            {/* Seleção de Espaço */}
            <div className="form-group">
              <label className="label">
                <MapPin size={20} />
                <span>Espaço Físico *</span>
              </label>
              <select
                value={selectedSpace}
                onChange={(e) => {
                  setSelectedSpace(e.target.value);
                  setAvailability(null);
                  setMessage({ type: '', text: '' });
                }}
                className="input"
                required
              >
                <option value="">Selecione um espaço</option>
                
                <optgroup label="🏢 PRÉDIO ORLANDO CASSIQUE - TÉRREO">
                  {spaces.filter(s => s.location === 'PRÉDIO ORLANDO CASSIQUE - TÉRREO').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="🏢 PRÉDIO ORLANDO CASSIQUE - 1º ANDAR">
                  {spaces.filter(s => s.location === 'PRÉDIO ORLANDO CASSIQUE - 1º ANDAR').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="🏢 PRÉDIO ORLANDO CASSIQUE - 2º ANDAR">
                  {spaces.filter(s => s.location === 'PRÉDIO ORLANDO CASSIQUE - 2º ANDAR').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="🏛️ PRÉDIO MARIA CORDEIRO - TÉRREO">
                  {spaces.filter(s => s.location === 'PRÉDIO MARIA CORDEIRO - TÉRREO').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="🏫 PRÉDIO CARLOS AMORIM - TÉRREO">
                  {spaces.filter(s => s.location === 'PRÉDIO CARLOS AMORIM - TÉRREO').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
                
                <optgroup label="🏫 PRÉDIO CARLOS AMORIM - 1º ANDAR">
                  {spaces.filter(s => s.location === 'PRÉDIO CARLOS AMORIM - 1º ANDAR').map(space => (
                    <option key={space.id} value={space.id}>
                      {space.name}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            {/* Data e Horários */}
            <div className="form-row">
              <div className="form-group">
                <label className="label">
                  <Calendar size={18} />
                  <span>Data *</span>
                </label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => {
                    setDate(e.target.value);
                    setAvailability(null);
                    setMessage({ type: '', text: '' });
                  }}
                  min={getMinDate()}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="label">
                  <Clock size={18} />
                  <span>Início *</span>
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => {
                    setStartTime(e.target.value);
                    setAvailability(null);
                    setMessage({ type: '', text: '' });
                  }}
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="label">
                  <Clock size={18} />
                  <span>Término *</span>
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => {
                    setEndTime(e.target.value);
                    setAvailability(null);
                    setMessage({ type: '', text: '' });
                  }}
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Botão de Verificar Disponibilidade */}
            <div className="availability-section">
              <button
                type="button"
                onClick={checkAvailability}
                disabled={checkingAvailability || !selectedSpace || !date || !startTime || !endTime}
                className="btn btn-secondary"
              >
                {checkingAvailability ? (
                  <>
                    <Loader className="spin" size={20} />
                    Verificando...
                  </>
                ) : (
                  <>
                    <CheckCircle size={20} />
                    Verificar Disponibilidade
                  </>
                )}
              </button>

              {availability !== null && (
                <div className={`availability-badge ${availability ? 'available' : 'unavailable'}`}>
                  {availability ? (
                    <>
                      <CheckCircle size={20} />
                      Disponível
                    </>
                  ) : (
                    <>
                      <XCircle size={20} />
                      Indisponível
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Informações do Solicitante */}
            <div className="form-row">
              <div className="form-group">
                <label className="label">
                  <User size={18} />
                  <span>Nome Completo *</span>
                </label>
                <input
                  type="text"
                  value={requesterName}
                  onChange={(e) => setRequesterName(e.target.value)}
                  placeholder="Seu nome completo"
                  className="input"
                  required
                />
              </div>
              
              <div className="form-group">
                <label className="label">
                  <Mail size={18} />
                  <span>E-mail *</span>
                </label>
                <input
                  type="email"
                  value={requesterEmail}
                  onChange={(e) => setRequesterEmail(e.target.value)}
                  placeholder="seu.email@campus.br"
                  className="input"
                  required
                />
              </div>
            </div>

            {/* Finalidade */}
            <div className="form-group">
              <label className="label">
                <AlertCircle size={18} />
                <span>Finalidade da Reserva</span>
              </label>
              <textarea
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                placeholder="Descreva brevemente o propósito da reserva..."
                rows="4"
                className="input textarea"
              />
            </div>

            {/* Botão de Submissão */}
            <button
              type="submit"
              disabled={loading || availability !== true}
              className="btn btn-primary"
            >
              {loading ? (
                <>
                  <Loader className="spin" size={24} />
                  Processando Reserva...
                </>
              ) : (
                <>
                  <CheckCircle size={24} />
                  Confirmar Reserva
                </>
              )}
            </button>

            <p className="form-footer">
              * Campos obrigatórios | Você receberá uma confirmação por e-mail
            </p>
          </form>
        </div>

        {/* Footer Info */}
        <div className="info-card">
          <p className="info-title">Sistema integrado com Google Calendar via N8N</p>
          <p className="info-subtitle">Automatização inteligente de reservas e notificações</p>
        </div>
      </main>
    </div>
  );
}

export default App;
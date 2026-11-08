import { useMemo, useState } from 'react'
import './ChatbotPage.css'

// DEMO DATA ONLY. Replace these values with approved hostel information before deployment.
const categories = [
  {
    name: 'Room & Accommodation', icon: '🏠',
    questions: [
      ['How can I check my room number?', 'Your assigned room and bed details are shown on Student Dashboard under Hostel Overview / My Room. Demo example: Visalakshi Hostel, Block A, Room A101, Bed A101-B1.'],
      ['What is the room capacity?', 'Demo room A101 has a capacity of 4 students. Your actual room capacity is shown in the room allocation records.'],
      ['How can I request a room change?', 'Submit a written room-change request to the warden with your reason. The request is subject to approval and room availability.'],
      ['How do I report a room maintenance issue?', 'Open Complaints, choose the closest category, mention your room number and describe the issue. You can track the complaint from the Complaints page.'],
    ],
  },
  {
    name: 'Outpass Assistance', icon: '🎫',
    questions: [
      ['How do I apply for an outpass?', 'Open Outpass, choose LOCAL or HOME, enter your destination and reason, select the required date and time, then submit it for warden approval.'],
      ['How can I check my outpass status?', 'Open the Outpass page. Your request will show its current status, such as PENDING, APPROVED, REJECTED, OUT or RETURNED.'],
      ['Can I reuse an old outpass barcode?', 'No. Every approved trip has a unique one-time barcode. Security verifies it at exit and again when you return. A used barcode must not be reused for another trip.'],
      ['What should I do if my outpass is rejected?', 'Read the status or rejection reason, then contact your warden if you need clarification. Submit a new request only if permitted.'],
      ['What are the sample outpass timings?', 'DEMO POLICY: LOCAL outpass requests should be submitted at least 2 hours before departure. HOME requests should be submitted at least 1 day in advance. These are sample rules, not official hostel policy.'],
    ],
  },
  {
    name: 'Complaint Support', icon: '📝',
    questions: [
      ['How do I submit a complaint?', 'Open Complaints, select a category, describe the issue clearly and submit it. Include your block, room number and when the issue started.'],
      ['How can I check my complaint status?', 'Open the Complaints page to see the status of your submitted complaints: PENDING, IN_PROGRESS, RESOLVED or REJECTED.'],
      ['What do complaint priorities mean?', 'HIGH, MEDIUM and LOW help organize complaints. This prototype assigns priority using keyword-based rules, so the label may not always reflect the real urgency. Contact hostel staff directly for urgent concerns.'],
      ['How long will a complaint take to resolve?', 'DEMO TARGETS: urgent maintenance issues are reviewed as soon as possible; normal complaints are reviewed within 1 working day; routine requests may take up to 3 working days. These are illustrative targets, not a service guarantee.'],
      ['What if my complaint is not resolved?', 'Check its latest status and contact the warden or hostel office with your complaint details or complaint ID.'],
    ],
  },
  {
    name: 'Mess & Food', icon: '🍽️',
    questions: [
      ['Where can I find the mess menu?', 'Here is the DEMO weekly mess menu. Monday: idli, sambar and chutney / rice, dal and vegetable poriyal / chapati and paneer curry. Tuesday: dosa and sambar / lemon rice and curd / vegetable pulao. Wednesday: pongal and chutney / rice, sambar and beans / chapati and chana masala. Thursday: poori and potato masala / rice, rasam and vegetable curry / dosa and kurma. Friday: upma and chutney / rice, dal and cabbage poriyal / chapati and mixed-vegetable curry. Saturday: bread and jam with boiled egg or banana / veg biryani and raita / rice and sambar. Sunday: dosa and chutney / rice, dal and potato fry / vegetable noodles. Menu is sample data and may be changed.'],
      ['What is the breakfast menu?', 'DEMO WEEKLY BREAKFAST: Monday—idli, sambar and chutney; Tuesday—dosa and sambar; Wednesday—pongal and chutney; Thursday—poori and potato masala; Friday—upma and chutney; Saturday—bread and jam with boiled egg or banana; Sunday—dosa and chutney. This is sample information.'],
      ['What is the lunch menu?', 'DEMO WEEKLY LUNCH: Monday—rice, dal and vegetable poriyal; Tuesday—lemon rice and curd; Wednesday—rice, sambar and beans; Thursday—rice, rasam and vegetable curry; Friday—rice, dal and cabbage poriyal; Saturday—vegetable biryani and raita; Sunday—rice, dal and potato fry. This is sample information.'],
      ['What is the dinner menu?', 'DEMO WEEKLY DINNER: Monday—chapati and paneer curry; Tuesday—vegetable pulao; Wednesday—chapati and chana masala; Thursday—dosa and kurma; Friday—chapati and mixed-vegetable curry; Saturday—rice and sambar; Sunday—vegetable noodles. This is sample information.'],
      ['What are the mess timings?', 'DEMO MESS TIMETABLE: Breakfast 7:30–9:00 AM; Lunch 12:30–2:00 PM; Evening snacks 4:30–5:30 PM; Dinner 7:30–9:00 PM. These timings are illustrative only.'],
      ['What is served for evening snacks?', 'DEMO SNACK ROTATION: Monday—sundal; Tuesday—vegetable puff; Wednesday—banana; Thursday—bajji; Friday—biscuits; Saturday—sweet; Sunday—samosa. Tea or milk may also be served.'],
      ['How can I report a food quality issue?', 'Tell the mess supervisor or warden and submit a complaint. Mention the date, meal, food item and a clear description.'],
      ['Are special meals available?', 'DEMO INFORMATION: Students should inform the mess supervisor in advance about approved dietary requirements. Availability depends on the mess arrangements.'],
    ],
  },
  {
    name: 'Visitor Management', icon: '👥',
    questions: [
      ['What are the visitor timings?', 'DEMO VISITING HOURS: 10:00 AM–6:00 PM on Saturdays, Sundays and approved holidays. Visitors must follow security instructions. Confirm official timings with the warden.'],
      ['How can my parents visit me?', 'Ask your warden or reception about the current visitor procedure. Visitors may be asked to show valid identification and enter their details in the visitor register.'],
      ['How do I register a visitor?', 'DEMO PROCESS: inform the warden in advance, provide the visitor name and relationship, and ask the visitor to complete registration at the security desk. The visitor-request feature is not yet connected to live records.'],
      ['Can visitors enter student rooms?', 'DEMO RULE: visitors should meet students only in the designated visitor area unless hostel staff provide written permission. Follow the official hostel policy.'],
    ],
  },
  {
    name: 'Fees & Payments', icon: '💳',
    questions: [
      ['How can I check my hostel fee status?', 'Open Fee Status in your Student Dashboard. The current prototype page may not yet be connected to live payment records.'],
      ['What is the sample hostel fee?', 'DEMO FEE STRUCTURE: Hostel accommodation ₹45,000 per academic year; mess charges ₹30,000 per academic year; refundable caution deposit ₹5,000. These are fictional example amounts, not your college fees.'],
      ['When is the fee payment deadline?', 'DEMO DEADLINE: first-year and returning students should complete payment by 15 July. Always follow the latest official fee circular for real deadlines.'],
      ['How can I get a fee receipt?', 'Use the official college payment portal or contact the accounts office. Keep the transaction reference number for follow-up.'],
      ['What payment methods are accepted?', 'DEMO OPTIONS: UPI, net banking, debit card and bank challan. Confirm the currently supported methods with the accounts office before paying.'],
    ],
  },
  {
    name: 'Notices & Announcements', icon: '📢',
    questions: [
      ['Where can I see hostel notices?', 'Open Notices in the Student Dashboard. Also check the official hostel notice board for announcements.'],
      ['Are there any sample upcoming notices?', 'DEMO NOTICE: Monthly hostel meeting — 10 November at 5:00 PM in the common hall. DEMO NOTICE: Water-tank cleaning — 12 November, 10:00 AM–1:00 PM. These are examples only.'],
      ['How can I check holiday announcements?', 'Check the Notices page and official college communication channels. Holiday dates must be confirmed through an official announcement.'],
      ['How often should I check notices?', 'DEMO SUGGESTION: check the Notices section once each morning and evening, especially before weekends and holidays.'],
    ],
  },
  {
    name: 'Hostel Rules & Regulations', icon: '📋',
    questions: [
      ['What is the hostel entry time?', 'DEMO RULE: students should return by 9:00 PM on regular days. Late entry requires prior approval from the warden. Confirm the actual hostel curfew before relying on this example.'],
      ['What are the hostel cleanliness rules?', 'Keep your bed and room tidy, use waste bins, keep shared bathrooms clean and report plumbing or hygiene issues through Complaints.'],
      ['Can students make noise late at night?', 'DEMO RULE: quiet hours are 10:00 PM–6:00 AM. Avoid loud music and activities that disturb roommates or nearby students.'],
      ['What should I do if I have a question about a rule?', 'Refer to the hostel handbook and ask your warden or hostel administration for the current written policy.'],
      ['Can I use electrical appliances in my room?', 'DEMO RULE: only appliances permitted by hostel management may be used. Ask the warden before bringing high-power appliances.'],
    ],
  },
  {
    name: 'Health & Medical Support', icon: '🩺',
    questions: [
      ['Where can I get medical help?', 'DEMO CAMPUS MEDICAL ROOM: open 9:00 AM–5:00 PM, Monday to Saturday. Contact the warden for directions or after-hours support. For an emergency in India, call 112.'],
      ['Who should I inform if I feel unwell?', 'Inform your warden or designated hostel staff and contact a qualified healthcare professional when needed.'],
      ['Is first aid available in the hostel?', 'DEMO INFORMATION: a basic first-aid kit is kept at the hostel office and security desk. Ask authorized staff for assistance.'],
      ['Does the chatbot provide medical diagnoses?', 'No. This assistant provides general directions only. It cannot diagnose conditions or replace professional medical care.'],
    ],
  },
  {
    name: 'Laundry Services', icon: '🧺',
    questions: [
      ['What are the laundry timings?', 'DEMO LAUNDRY DESK: Monday–Saturday, 8:00–10:00 AM for collection and 5:00–6:00 PM for distribution. Sunday is a holiday.'],
      ['When will I get my clothes back?', 'DEMO TURNAROUND: regular laundry is returned within 48 hours. Delays may occur on holidays or during busy periods.'],
      ['What are the laundry charges?', 'DEMO CHARGES: wash and fold ₹40 per kg; ironing ₹8 per item; express service ₹70 per kg. These are fictional sample rates.'],
      ['What should I do if clothes are missing?', 'Contact the laundry desk or hostel office. Share your laundry token, item description and collection date.'],
    ],
  },
  {
    name: 'Wi-Fi & Internet Support', icon: '📶',
    questions: [
      ['What should I do if hostel Wi-Fi is not working?', 'Check that Wi-Fi is enabled, reconnect to the official hostel network and restart your device. If the issue continues, report your block, floor and approximate time to IT support.'],
      ['What is the sample Wi-Fi network name?', 'DEMO NETWORK NAME: HostelHub_Student. Ask authorized IT staff for the real network name and access procedure. No password is stored in this chatbot.'],
      ['How do I report slow internet?', 'Record the affected location and approximate time, then contact IT support or submit a complaint under the internet/Wi-Fi category.'],
      ['Can I share my Wi-Fi password?', 'Do not post passwords in public chats or share account credentials. Follow the instructions provided by authorized IT staff.'],
    ],
  },
  {
    name: 'Facilities & Maintenance', icon: '🔧',
    questions: [
      ['What facilities are available in the hostel?', 'DEMO FACILITIES: study hall, common room, drinking-water station, indoor games area, laundry desk, Wi-Fi and visitor waiting area. Actual facilities depend on the hostel.'],
      ['How do I report a water problem?', 'Submit a maintenance complaint with your block, floor and room number. Inform hostel staff directly if the issue needs urgent attention.'],
      ['How do I report a fan or light problem?', 'Open Complaints, choose the closest category and describe the room and equipment affected.'],
      ['What should I do about an electrical safety concern?', 'Do not touch damaged electrical equipment. Keep away and inform the warden or authorized maintenance staff immediately.'],
      ['When is maintenance available?', 'DEMO MAINTENANCE DESK: Monday–Saturday, 9:00 AM–5:00 PM. Report urgent issues to the on-duty hostel staff outside these hours.'],
    ],
  },
  {
    name: 'Lost & Found', icon: '🔎',
    questions: [
      ['Where should I report a lost item?', 'Contact hostel reception or the warden and provide the item description, approximate time and location where you last saw it.'],
      ['Where can I collect a found item?', 'DEMO COLLECTION POINT: hostel reception, ground floor, Block A. Staff may ask you to describe the item before handing it over.'],
      ['What should I do if I lose my ID card?', 'Inform the college or hostel office and follow the official lost-ID and replacement procedure.'],
      ['What if I find someone else’s belongings?', 'Hand the item to hostel reception or the warden. Do not keep another student’s belongings.'],
    ],
  },
  {
    name: 'Student Activities & Events', icon: '🏆',
    questions: [
      ['What activities are available?', 'DEMO ACTIVITIES: badminton, table tennis, chess, carrom, volleyball, indoor games and weekend cultural activities. Ask the student coordinator about current availability.'],
      ['Are there any sample upcoming events?', 'DEMO EVENT: Hostel Sports Day — 20 November at 9:00 AM. DEMO EVENT: Cultural Evening — 28 November at 6:00 PM. These are sample dates, not confirmed events.'],
      ['How can I participate in sports activities?', 'Contact the hostel or college sports coordinator and ask about practice schedules, team selection and registration.'],
      ['How can I suggest an event?', 'Share your idea with the warden, student representative or hostel activities coordinator. Include a suggested date and basic plan.'],
    ],
  },
  {
    name: 'Contact & Helpdesk', icon: '☎️',
    questions: [
      ['How can I contact my warden?', 'DEMO CONTACT: Warden Office, Block A, Ground Floor. Office hours: 9:00 AM–5:00 PM. Sample phone: 90000 00001. Replace this with the official contact before deployment.'],
      ['Who can help with a portal issue?', 'DEMO TECH SUPPORT: HostelHub Helpdesk, Administration Block, 10:00 AM–4:00 PM. Sample email: support@example.com. Do not share your password.'],
      ['How can I contact hostel security?', 'DEMO SECURITY DESK: Main hostel entrance, available 24 hours. Sample phone: 90000 00002. Replace this with the official number before deployment.'],
      ['What should I do if I need help after office hours?', 'Contact the designated on-duty warden or security desk using the official hostel contact procedure. For immediate emergencies in India, call 112.'],
    ],
  },
]

function makeMessage(sender, text) {
  return { id: `${Date.now()}-${Math.random()}`, sender, text }
}

function normalize(value) {
  return value.toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

export default function ChatbotPage({ student }) {
  const [messages, setMessages] = useState([
    makeMessage('bot', `Hello${student?.name ? `, ${student.name.split(' ')[0]}` : ''}! Welcome to HostelHub Assistant. I can answer questions using our sample hostel information. Choose a category or type your question below.`),
  ])
  const [selectedCategory, setSelectedCategory] = useState(categories[0])
  const [input, setInput] = useState('')

  const allQuestions = useMemo(
    () => categories.flatMap((category) =>
      category.questions.map(([question, answer]) => ({ category: category.name, question, answer }))
    ),
    []
  )

  const askQuestion = (question, answer) => {
    setMessages((current) => [...current, makeMessage('user', question), makeMessage('bot', answer)])
  }

  const sendMessage = (event) => {
    event.preventDefault()
    const query = input.trim()
    if (!query) return

    const normalized = normalize(query)
    const words = normalized.split(' ').filter((word) => word.length > 2)
    let bestMatch = null
    let bestScore = 0

    for (const item of allQuestions) {
      const searchable = normalize(`${item.category} ${item.question}`)
      let score = 0
      for (const word of words) {
        if (searchable.includes(word)) score += 1
      }
      if (searchable.includes(normalized) || normalized.includes(normalize(item.question).replace(/\?/g, ''))) score += 5
      if (score > bestScore) {
        bestScore = score
        bestMatch = item
      }
    }

    const categoryMatch = categories.find((category) => normalized.includes(normalize(category.name)))
    let answer
    if (bestMatch && bestScore >= 1) {
      answer = bestMatch.answer
      const matchedCategory = categories.find((category) => category.name === bestMatch.category)
      if (matchedCategory) setSelectedCategory(matchedCategory)
    } else if (categoryMatch) {
      setSelectedCategory(categoryMatch)
      answer = `You selected ${categoryMatch.name}. Choose one of the suggested questions below so I can show the relevant sample information.`
    } else {
      answer = 'I could not find a close match in the sample hostel knowledge base. Try selecting one of the 15 categories or rephrase your question. For official timings, fees, policies or urgent help, contact hostel staff directly.'
    }

    setMessages((current) => [...current, makeMessage('user', query), makeMessage('bot', answer)])
    setInput('')
  }

  return (
    <section className="chatbot-page">
      <div className="chatbot-heading">
        <div>
          <p className="chatbot-eyebrow">STUDENT SUPPORT CENTRE</p>
          <h1>HostelHub AI Assistant</h1>
          <p>Find sample information and guidance for common hostel services.</p>
        </div>
        <div className="chatbot-status"><span /> Assistant available</div>
      </div>

      <div className="chatbot-layout">
        <aside className="chatbot-categories">
          <h2>Browse categories</h2>
          <p>Select a category to see common questions.</p>
          <div className="chatbot-category-list">
            {categories.map((category) => (
              <button
                type="button"
                key={category.name}
                className={`chatbot-category ${selectedCategory.name === category.name ? 'selected' : ''}`}
                onClick={() => setSelectedCategory(category)}
              >
                <span>{category.icon}</span>
                <span>{category.name}</span>
              </button>
            ))}
          </div>
        </aside>

        <div className="chatbot-main">
          <div className="chatbot-card">
            <div className="chatbot-card-header">
              <div className="chatbot-avatar">🤖</div>
              <div>
                <h2>Chat with HostelHub</h2>
                <p>Choose a suggested question or type below.</p>
              </div>
            </div>

            <div className="chatbot-messages" aria-live="polite">
              {messages.map((message) => (
                <div key={message.id} className={`chat-message ${message.sender}`}>
                  <div className="chat-message-bubble">{message.text}</div>
                </div>
              ))}
            </div>

            <div className="chatbot-suggestions">
              <h3>{selectedCategory.icon} {selectedCategory.name}</h3>
              <div className="chatbot-question-list">
                {selectedCategory.questions.map(([question, answer]) => (
                  <button type="button" key={question} onClick={() => askQuestion(question, answer)}>
                    {question}
                  </button>
                ))}
              </div>
            </div>

            <form className="chatbot-input-row" onSubmit={sendMessage}>
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                placeholder="Ask about mess menu, timings, fees, rules..."
                aria-label="Type your question"
              />
              <button type="submit" disabled={!input.trim()}>Send</button>
            </form>
            <p className="chatbot-disclaimer">
              DEMO MODE: This chatbot uses sample hostel information, not official or live hostel records. Replace all sample timings, prices, dates and contacts with verified information before deployment. For urgent concerns, contact hostel staff directly.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}

import ProgramCard from '../../components/ProgramCard/ProgramCard'

function Programs() {
  const programs = [
    {
      icon: '🏠',
      title: 'Shelter & Care',
      description:
        'Safe accommodation, nutritious meals, clothing, hygiene support, and daily care for children.',
    },
    {
      icon: '📚',
      title: 'Education Support',
      description:
        'School fees, books, tutoring, mentorship, computer literacy, and academic encouragement.',
    },
    {
      icon: '❤️',
      title: 'Health & Wellbeing',
      description:
        'Medical support, counseling, emotional care, trauma recovery, and child protection.',
    },
    {
      icon: '🎨',
      title: 'Activities & Recreation',
      description:
        'Sports, music, art, cultural activities, events, and confidence-building programs.',
    },
  ]

  return (
    <section className="section section--light" id="programs">
      <div className="container">
        <div className="section__center">
          <p className="eyebrow">Our Programs</p>
          <h2>How we support children</h2>
          <p>
            Our work focuses on the full development of every child: safety,
            education, wellbeing, confidence, and long-term opportunity.
          </p>
        </div>

        <div className="card-grid">
          {programs.map((program) => (
            <ProgramCard
              key={program.title}
              icon={program.icon}
              title={program.title}
              description={program.description}
            />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Programs
function ProgramCard({ icon, title, description }) {
  return (
    <article className="card program-card">
      <div className="program-card__icon">{icon}</div>
      <h3>{title}</h3>
      <p>{description}</p>
    </article>
  )
}

export default ProgramCard
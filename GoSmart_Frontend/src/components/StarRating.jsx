export default function StarRating({ value = 0, onChange, size = 22, readOnly = false }) {
  const stars = [1, 2, 3, 4, 5];
  return (
    <div style={{ display: "inline-flex", gap: 3 }}>
      {stars.map((n) => (
        <span
          key={n}
          onClick={() => !readOnly && onChange && onChange(n)}
          style={{
            cursor: readOnly ? "default" : "pointer",
            fontSize: size,
            color: n <= value ? "#f0a500" : "#e1e6ec",
            lineHeight: 1,
            userSelect: "none",
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

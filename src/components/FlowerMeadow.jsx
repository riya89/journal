import f1 from '../assets/flower1.png';
import f2 from '../assets/flower2.png';
import f3 from '../assets/flower3.png';
import f4 from '../assets/flower4.png';
import f5 from '../assets/flower5.png';
import f6 from '../assets/flower6.png';

const imgs = [f1, f2, f3, f4, f5, f6];

export default function FlowerMeadow() {
  // repeat across the bottom
  const strip = Array.from({ length: 40 }).map((_, i) => imgs[i % imgs.length]);
  return (
    <div className="meadow">
      <div className="flower-strip">
        {strip.map((src, i) => (
          <img key={i} src={src} className="flower" alt="" />
        ))}
      </div>
    </div>
  );
}

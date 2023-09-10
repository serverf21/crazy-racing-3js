import { useRef, useEffect } from 'react';
import { useBox } from '@react-three/cannon';
import { Instance } from '@react-three/drei';

export default function Cube({ position, rotation, color, args, onCollide, cubeInstanceRefs, index }) {
  const [cubeRef] = useBox(() => ({
    mass: 1,
    args,
    position,
    rotation,
    onCollide,
    restitution: 0.9,
    friction: 0.1,
    userData: {
      name: 'cube',
    }
  }));

  const cubeInstanceRef = useRef();
  const argsRef = useRef(args);

  useEffect(() => {
    cubeInstanceRefs.current[index] = cubeInstanceRef.current;
    return () => {
      cubeInstanceRefs.current[index] = null;
    };
  }, [cubeInstanceRefs, index, argsRef]);

  return (
    <>
      <Instance
        ref={(instance) => {
          cubeRef.current = instance;
          cubeInstanceRef.current = instance;
        }}
        color={color}
				index={index}
      />
    </>
  );
}

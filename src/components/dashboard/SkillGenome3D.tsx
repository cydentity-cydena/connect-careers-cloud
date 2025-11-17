import { Canvas } from "@react-three/fiber";
import { OrbitControls, Text, Line } from "@react-three/drei";
import { useRef, useMemo } from "react";
import * as THREE from "three";

interface SkillData {
  name: string;
  value: number; // 0-100
  category: string;
  color: string;
}

interface SkillGenome3DProps {
  skills: SkillData[];
}

function RadarChart({ skills }: { skills: SkillData[] }) {
  const groupRef = useRef<THREE.Group>(null);
  
  const skillCount = skills.length;
  const angleStep = (Math.PI * 2) / skillCount;
  
  // Create radar grid circles
  const gridCircles = useMemo(() => {
    const circles = [];
    for (let i = 1; i <= 5; i++) {
      const radius = i * 0.4;
      const points: THREE.Vector3[] = [];
      
      for (let j = 0; j <= skillCount; j++) {
        const angle = j * angleStep - Math.PI / 2;
        points.push(new THREE.Vector3(
          Math.cos(angle) * radius,
          Math.sin(angle) * radius,
          0
        ));
      }
      
      circles.push(
        <Line
          key={i}
          points={points}
          color="#444444"
          lineWidth={1}
          opacity={0.3}
          transparent
        />
      );
    }
    return circles;
  }, [skillCount, angleStep]);

  // Create axis lines
  const axisLines = useMemo(() => {
    return skills.map((_, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const points = [
        new THREE.Vector3(0, 0, 0),
        new THREE.Vector3(Math.cos(angle) * 2, Math.sin(angle) * 2, 0)
      ];
      
      return (
        <Line
          key={index}
          points={points}
          color="#666666"
          lineWidth={1}
          opacity={0.5}
          transparent
        />
      );
    });
  }, [skills, angleStep]);

  // Create skill data polygon
  const skillPolygon = useMemo(() => {
    const points: THREE.Vector3[] = [];
    
    skills.forEach((skill, index) => {
      const angle = index * angleStep - Math.PI / 2;
      const radius = (skill.value / 100) * 2;
      points.push(new THREE.Vector3(
        Math.cos(angle) * radius,
        Math.sin(angle) * radius,
        0
      ));
    });
    
    // Close the polygon
    if (points.length > 0) {
      points.push(points[0].clone());
    }
    
    return points;
  }, [skills, angleStep]);

  // Create filled area
  const fillGeometry = useMemo(() => {
    const shape = new THREE.Shape();
    skillPolygon.forEach((point, index) => {
      if (index === 0) {
        shape.moveTo(point.x, point.y);
      } else {
        shape.lineTo(point.x, point.y);
      }
    });
    return new THREE.ShapeGeometry(shape);
  }, [skillPolygon]);

  return (
    <group ref={groupRef}>
      {/* Grid circles */}
      {gridCircles}
      
      {/* Axis lines */}
      {axisLines}
      
      {/* Skill data polygon outline */}
      <Line
        points={skillPolygon}
        color="#00ff88"
        lineWidth={3}
      />
      
      {/* Filled area */}
      <mesh geometry={fillGeometry}>
        <meshBasicMaterial 
          color="#00ff88" 
          transparent 
          opacity={0.2}
          side={THREE.DoubleSide}
        />
      </mesh>
      
      {/* Skill labels and dots */}
      {skills.map((skill, index) => {
        const angle = index * angleStep - Math.PI / 2;
        const radius = (skill.value / 100) * 2;
        const labelRadius = 2.3;
        
        return (
          <group key={skill.name}>
            {/* Skill value dot */}
            <mesh position={[
              Math.cos(angle) * radius,
              Math.sin(angle) * radius,
              0
            ]}>
              <sphereGeometry args={[0.06, 16, 16]} />
              <meshBasicMaterial color={skill.color} />
            </mesh>
            
            {/* Skill label */}
            <Text
              position={[
                Math.cos(angle) * labelRadius,
                Math.sin(angle) * labelRadius,
                0
              ]}
              fontSize={0.12}
              color="white"
              anchorX="center"
              anchorY="middle"
            >
              {skill.name}
            </Text>
            
            {/* Skill value */}
            <Text
              position={[
                Math.cos(angle) * (labelRadius + 0.3),
                Math.sin(angle) * (labelRadius + 0.3),
                0
              ]}
              fontSize={0.1}
              color={skill.color}
              anchorX="center"
              anchorY="middle"
            >
              {skill.value}%
            </Text>
          </group>
        );
      })}
    </group>
  );
}

export function SkillGenome3D({ skills }: SkillGenome3DProps) {
  return (
    <div className="w-full h-[600px] rounded-lg overflow-hidden bg-gradient-to-br from-slate-950 to-slate-900 border border-border">
      <Canvas camera={{ position: [0, 0, 5], fov: 50 }}>
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} />
        <RadarChart skills={skills} />
        <OrbitControls 
          enableZoom={true}
          enablePan={false}
          minDistance={3}
          maxDistance={8}
          autoRotate
          autoRotateSpeed={0.5}
        />
      </Canvas>
    </div>
  );
}

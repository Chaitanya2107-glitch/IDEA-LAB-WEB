import React, { useState } from 'react';
import { Target, Eye, Lightbulb, Zap, Award, Globe, History, Cpu, PenTool, Users, ArrowRight, Github, Linkedin, Mail, Twitter, ChevronLeft, ChevronRight, Rocket } from 'lucide-react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FadeIn } from '../components/FadeIn';

/* ── Team Data ── */
const FACULTY = [
  { name: "Dr. P. Shyama Raju", role: "Chancellor", image: "https://upload.wikimedia.org/wikipedia/commons/6/6f/Dr_P_Shyama_Raju.png", designation: "Chief Patron", email: "chancellor@reva.edu.in", linkedin: "#" },
  { name: "Dr. M. Dhanamjaya", role: "Vice Chancellor", image: "https://files.reva.ac.in/uploads/trustees/68da5cf338b461759141107.webp", designation: "Patron", email: "vc@reva.edu.in", linkedin: "#" },
  { name: "Dr. Rajashekhar C. Biradar", role: "Pro-Vice Chancellor", image: "https://files.reva.ac.in/uploads/faculty_images/6437b0bff00781681371327.webp", designation: "Chief Mentor", email: "pvc@reva.edu.in", linkedin: "#" },
  { name: "Dr. Manjula R. Bharamagoudra", role: "Professor", image: "https://files.reva.ac.in/uploads/faculty_images/64379dc274a8a1681366466.webp", designation: "Faculty Coordinator", email: "manjula.rb@reva.edu.in", linkedin: "#" },
  { name: "Dr. S.Sudhagara Rajan", role: "Associate Professor", image: "https://files.reva.ac.in/uploads/faculty_images/67dd4e060e7ad1742556678.webp", designation: "Tech Guru", email: "adithya@reva.edu.in", linkedin: "#" },
  { name: "Prof. Karthik E C", role: "Assistant Professor", image: "https://files.reva.ac.in/uploads/faculty_images/67875726bb1771736922918.webp", designation: "Tech Guru", email: "adithya@reva.edu.in", linkedin: "#" },
  { name: "Dr. Nikhath Tabassum", role: "Assistant Professor", image: "https://files.reva.ac.in/uploads/faculty_images/6437c6da72d941681376986.webp", designation: "Tech Guru", email: "adithya@reva.edu.in", linkedin: "#" },
];

const STUDENTS = [
  { name: "Madhavan R", role: "Student Ambassador", image: "https://ieeereva.in/wp-content/uploads/2025/10/Untitled-4-madhavan-300x300.png", designation: "Web Lead", email: "sarah@reva.edu.in", linkedin: "#" },
  { name: "Suryansh Singh", role: "Student Ambassador", image: "https://ui-avatars.com/api/?name=Suryanshl&background=random&size=400", designation: "Operations", email: "rahul@reva.edu.in", linkedin: "#" },
  { name: "Amit Patel", role: "Hardware Lead", image: "https://ui-avatars.com/api/?name=Amit&background=random&size=400", designation: "Electronics", email: "amit@reva.edu.in", linkedin: "#" },
];


const TeamMemberCard: React.FC<{ member: any }> = ({ member }) => (
    <div className="relative group w-full max-w-[300px] mb-8">
        <div className="bg-white rounded-[3.5rem] border border-slate-120 shadow-sm transition-all duration-500 hover:shadow-xl hover:shadow-brand-500/5 p-8 pt-20 text-center relative mt-16">
            {/* Simple Portrait Frame */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-28 h-28 md:w-44 md:h-44 z-20">
                <div className="w-full h-full rounded-full border-[6px] border-white shadow-lg bg-slate-50 overflow-hidden relative">
                    <img 
                        src={member.image} 
                        alt={member.name} 
                        className="w-full h-full object-cover object-[center_20%] transition-transform duration-500 group-hover:scale-105"
                    />
                </div>
            </div>

            {/* Info */}
            {/*bring the text below*/}
            <h3 className="text-md font-display font-black text-slate-900 mb-1 uppercase tracking-tight ">
                {member.name}
            </h3>
            <p className="text-brand-600 font-bold text-xs uppercase tracking-widest mb-3">
                {member.role}
            </p>
            <div className="w-8 h-0.5 bg-brand-500/20 mx-auto mb-4" />
            <p className="text-slate-400 text-[10px] font-medium uppercase tracking-[0.2em] italic mb-6">
                {member.designation}
            </p>

            {/* Socials */}
            <div className="flex justify-center gap-3">
                <a href={member.linkedin} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                    <Linkedin className="w-4 h-4" />
                </a>
                <a href={`mailto:${member.email}`} className="p-2.5 bg-slate-50 rounded-xl text-slate-400 hover:bg-brand-600 hover:text-white transition-all">
                    <Mail className="w-4 h-4" />
                </a>
            </div>
        </div>
    </div>
);

const About: React.FC = () => {


    return (
        <div className="min-h-screen bg-white">
            {/* ── Hero ── */}
            <div className="relative bg-gradient-to-br from-slate-950 via-brand-950 to-slate-900 pt-24 pb-16 md:pt-40 md:pb-28 overflow-hidden">
                <div className="absolute inset-0 pointer-events-none opacity-20">
                    <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-brand-600 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-purple-600 rounded-full blur-[100px]" />
                </div>
                <div className="relative max-w-5xl mx-auto px-6 text-center">
                    <FadeIn>
                        <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-brand-300 font-bold text-[10px] uppercase tracking-[0.3em] mb-8">
                            <Globe className="w-3.5 h-3.5" /> Established 2026
                        </span>
                        <h1 className="text-3xl md:text-7xl font-display font-black text-white mb-6 leading-[1.1]">
                            The Heart of <br />
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-amber-300">Making.</span>
                        </h1>
                        <p className="text-slate-400 text-lg max-w-2xl mx-auto leading-relaxed">
                            REVA University's IDEA Lab is a flagship manufacturing hub dedicated to fostering innovation through industrial-grade tools and hands-on expertise.
                        </p>
                    </FadeIn>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
                {/* Mission / Vision */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center mb-40">
                    <FadeIn>
                        <div className="space-y-16">
                            <div className="relative">
                                <div className="absolute -left-4 top-0 w-1 h-12 bg-brand-600" />
                                <h2 className="text-3xl font-display font-black text-slate-900 mb-6 uppercase tracking-tight">Our Mission</h2>
                                <p className="text-slate-500 text-lg leading-relaxed">
                                    To provide a world-class collaborative workspace where student-led groups, faculty, and industry pioneers utilize advanced machinery to bridge the gap between classroom theory and real-world mastery.
                                </p>
                            </div>
                            <div className="relative">
                                <div className="absolute -left-4 top-0 w-1 h-12 bg-purple-600" />
                                <h2 className="text-3xl font-display font-black text-slate-900 mb-6 uppercase tracking-tight">Our Vision</h2>
                                <p className="text-slate-500 text-lg leading-relaxed">
                                    To empower the next generation of creators, entrepreneurs, and dreamers with the tools and mentorship required to turn their biggest ideas into tangible, impactful solutions.
                                </p>
                            </div>
                        </div>
                    </FadeIn>
                    <FadeIn delay={0.2}>
                        <div className="relative aspect-square rounded-[3rem] overflow-hidden shadow-2xl">
                            <img 
                                src="/img/comp/DSC09532.JPG" 
                                alt="Idea Lab" 
                                loading="lazy"
                                width="800"
                                height="800"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/40 to-transparent" />
                        </div>
                    </FadeIn>
                </div>

                {/* Values */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 mb-48">
                    {[
                        { icon: Lightbulb, title: "Innovate", desc: "Pushing the boundaries of what is possible through rapid prototyping.", color: "text-amber-500", bg: "bg-amber-50" },
                        { icon: Users, title: "Collaborate", desc: "Creating a cross-disciplinary junction for diverse student groups.", color: "text-blue-500", bg: "bg-blue-50" },
                        { icon: Rocket, title: "Accelerate", desc: "Turning local ideas into industrial solutions with speed.", color: "text-brand-600", bg: "bg-brand-50" }
                    ].map((item: any, idx) => (
                        <FadeIn key={idx} delay={idx * 0.1}>
                            <div className="p-10 bg-slate-50 rounded-[2.5rem] hover:bg-white border border-transparent hover:border-slate-100 hover:shadow-xl transition-all duration-300">
                                <div className={`w-14 h-14 ${item.bg} rounded-2xl flex items-center justify-center mb-6`}>
                                    <item.icon className={`w-7 h-7 ${item.color}`} />
                                </div>
                                <h3 className="text-xl font-black text-slate-900 mb-3">{item.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{item.desc}</p>
                            </div>
                        </FadeIn>
                    ))}
                </div>

                {/* Team Section */}
                <div id="team" className="space-y-40">
                    <FadeIn>
                        <div className="text-center max-w-3xl mx-auto space-y-4">
                            <h2 className="text-5xl font-display font-black text-slate-900 uppercase tracking-tighter">Meet The Architects</h2>
                            <p className="text-slate-400 text-lg">The visionary faculty and student leaders behind the REVA IDEA Lab.</p>
                        </div>
                    </FadeIn>

                    {/* Faculty Section */}
                    <div className="space-y-12">
                        <div className="flex items-center gap-8">
                            <h3 className="text-xl font-display font-black text-brand-600 uppercase tracking-[0.3em] whitespace-nowrap">Leadership</h3>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>
                        
                        {/* Desktop: Grid | Tablet/Mobile: Carousel */}
                        <div className="lg:grid lg:grid-cols-3 lg:gap-8 hidden">
                            {FACULTY.map((m, i) => <div key={i} className="flex justify-center"><TeamMemberCard member={m} /></div>)}
                        </div>
                        <div 
                            className="flex lg:hidden overflow-x-auto gap-8 pb-12 px-4 snap-center snap-mandatory scrollbar-hide pt-10"
                        >
                            {FACULTY.map((m, i) => <div key={i} className="snap-center shrink-0 w-[280px]"><TeamMemberCard member={m} /></div>)}
                        </div>
                    </div>

                    {/* Students Section */}
                    <div className="space-y-12 pb-24">
                        <div className="flex items-center gap-6">
                            <h3 className="text-xl font-display font-black text-purple-600 uppercase tracking-[0.3em] whitespace-nowrap">Student Leads</h3>
                            <div className="h-px bg-slate-100 w-full" />
                        </div>
                        
                        <div className="lg:grid lg:grid-cols-3 lg:gap-8 hidden max-w-5xl mx-auto">
                            {STUDENTS.map((m, i) => <div key={i} className="flex justify-center"><TeamMemberCard member={m} /></div>)}
                        </div>

                        <div 
                            className="flex lg:hidden overflow-x-auto gap-8 pb-12 px-4 snap-center snap-mandatory scrollbar-hide pt-10"
                        >
                            {STUDENTS.map((m, i) => <div key={i} className="snap-center shrink-0 w-[280px]"><TeamMemberCard member={m} /></div>)}
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer CTA */}
            <div className="bg-slate-50 py-32 text-center px-4">
                <FadeIn>
                    <h2 className="text-5xl font-display font-black text-slate-900 mb-6 uppercase tracking-tighter">Ready to Build?</h2>
                    <p className="text-slate-400 max-w-md mx-auto mb-10 text-lg">Your transformation from student to innovator starts here.</p>
                    <Link to="/login" className="px-12 py-5 bg-brand-600 text-white font-black rounded-full hover:bg-slate-900 transition-all hover:scale-110 shadow-xl shadow-brand-600/25 inline-flex items-center gap-3">
                        GET STARTED <ArrowRight className="w-5 h-5" />
                    </Link>
                </FadeIn>
            </div>
        </div>
    );
};

export default About;

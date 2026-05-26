import EmbeddedOIChat from "../components/EmbeddedOIChat";

export default function HealthOIPage() {
  return (
    <main style={{
      minHeight:"100vh",
      background:"radial-gradient(circle at 18% 12%, #dff7ea 0%, transparent 28%), radial-gradient(circle at 85% 18%, #dceeff 0%, transparent 30%), linear-gradient(135deg,#f6fbf7 0%,#eaf7f0 42%,#ffffff 100%)",
      color:"#101513",
      fontFamily:"Arial, sans-serif"
    }}>
      <header style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"22px 28px 0",
        display:"flex",
        justifyContent:"space-between",
        alignItems:"center",
        gap:"18px"
      }}>
        <a href="/healthoi" style={{
          display:"flex",
          alignItems:"center",
          gap:"12px",
          color:"#0f2f24",
          textDecoration:"none",
          fontWeight:800
        }}>
          <span style={{
            width:"38px",
            height:"38px",
            borderRadius:"14px",
            display:"inline-flex",
            alignItems:"center",
            justifyContent:"center",
            background:"linear-gradient(135deg,#0b1511,#123e2c)",
            color:"#fff",
            boxShadow:"0 10px 24px rgba(11,21,17,.18)"
          }}>
            ◆
          </span>
          <span>
            <span style={{display:"block",fontSize:"20px",letterSpacing:"-0.5px"}}>HealthOI</span>
            <span style={{display:"block",fontSize:"12px",color:"#5d7067",fontWeight:600}}>
              Optimized Intelligence for Health
            </span>
          </span>
        </a>

        <a href="#healthoi-chat" style={{
          background:"linear-gradient(135deg,#0b1511,#123e2c)",
          color:"#fff",
          padding:"12px 18px",
          borderRadius:"12px",
          textDecoration:"none",
          fontWeight:700,
          fontSize:"14px"
        }}>
          Try Free
        </a>
      </header>

      <section style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"56px 28px 44px"
      }}>
        <div style={{
          display:"inline-flex",
          alignItems:"center",
          gap:"8px",
          padding:"8px 14px",
          border:"1px solid #b9e4c9",
          background:"rgba(255,255,255,.9)", boxShadow:"0 10px 30px rgba(31,122,77,.08)",
          borderRadius:"999px",
          fontSize:"13px",
          fontWeight:700,
          color:"#1f7a4d",
          marginBottom:"24px"
        }}>
          ◆ Private Founding Beta Now Open
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(320px,1fr))",
          gap:"42px",
          alignItems:"center"
        }}>
          <div>
            <h1 style={{
              fontSize:"clamp(44px,7vw,76px)",
              lineHeight:"0.95",
              letterSpacing:"-3px",
              margin:"0 0 22px",
              color:"#0f2f24"
            }}>
              Smarter Health Decisions.
              <br />
              Powered by OI.
            </h1>

            <p style={{
              fontSize:"20px",
              lineHeight:"1.55",
              color:"#33433b",
              maxWidth:"680px",
              margin:"0 0 28px"
            }}>
              HealthOI helps you think through supplements, symptoms, fasting,
              recovery, sleep, stress, performance, and product labels with
              clear, mechanism-first intelligence.
            </p>

            <div style={{display:"flex",gap:"14px",flexWrap:"wrap",marginBottom:"28px"}}>
              <a href="#healthoi-chat" style={{
                background:"linear-gradient(135deg,#0b1511,#123e2c)",
                color:"#fff",
                padding:"16px 24px",
                borderRadius:"14px",
                textDecoration:"none",
                fontWeight:700,
                boxShadow:"0 14px 30px rgba(11,21,17,.18)"
              }}>
                Try HealthOI Free
              </a>

              <a href="#examples" style={{
                background:"#fff",
                color:"#0f2f24",
                padding:"16px 24px",
                borderRadius:"14px",
                textDecoration:"none",
                fontWeight:700,
                border:"1px solid #d8e3dd"
              }}>
                See Example Questions
              </a>
            </div>

            <div style={{
              display:"flex",
              gap:"16px",
              flexWrap:"wrap",
              color:"#51645a",
              fontSize:"14px"
            }}>
              <span>✓ Supplement stack reviews</span>
              <span>✓ Fasting support</span>
              <span>✓ Recovery guidance</span>
              <span>✓ Label analysis</span>
            </div>
          </div>

          <div style={{
            background:"linear-gradient(135deg,#0b1511,#123e2c)",
            color:"#fff",
            borderRadius:"28px",
            padding:"28px",
            boxShadow:"0 34px 80px rgba(18,62,44,.32)",
            border:"1px solid rgba(255,255,255,.12)"
          }}>
            <div style={{
              display:"flex",
              justifyContent:"space-between",
              alignItems:"center",
              marginBottom:"22px",
              color:"#b9d1c5",
              fontSize:"13px"
            }}>
              <strong>HealthOI Analysis</strong>
              <span>AH3 + HX2</span>
            </div>

            <div style={{
              background:"rgba(255,255,255,.08)",
              border:"1px solid rgba(255,255,255,.12)",
              borderRadius:"18px",
              padding:"18px",
              marginBottom:"14px"
            }}>
              <div style={{fontSize:"13px",color:"#a8c2b6",marginBottom:"8px"}}>Question</div>
              <div style={{fontSize:"18px",lineHeight:"1.4"}}>
                “I take NAC, magnesium, and creatine while fasting and felt dizzy.”
              </div>
            </div>

            <div style={{
              background:"#ffffff",
              color:"#132019",
              borderRadius:"18px",
              padding:"18px"
            }}>
              <div style={{fontSize:"13px",color:"#48745e",fontWeight:700,marginBottom:"10px"}}>
                Bottom Line
              </div>
              <p style={{margin:"0 0 12px",lineHeight:"1.45"}}>
                Think sodium + hydration first, magnesium second. Creatine raises
                hydration importance during fasting.
              </p>
              <div style={{fontSize:"13px",color:"#51645a"}}>
                → Best next move: stabilize electrolytes before adding more supplements.
              </div>
            </div>
          </div>
        </div>
      </section>

      <section style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"28px",
        display:"grid",
        gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",
        gap:"16px"
      }}>
        {[
          ["Supplement Clarity","Understand timing, dose, stacking, and possible tolerance issues."],
          ["Fasting + Recovery","Spot hydration, sodium, fuel, and recovery patterns faster."],
          ["Product Label Review","Separate useful ingredients from hype, fillers, and weak claims."],
          ["Stress + Sleep Support","Build cleaner routines for nervous system and recovery support."]
        ].map(([title,body]) => (
          <div key={title} style={{
            background:"#fff",
            border:"1px solid #dce8e1",
            borderRadius:"22px",
            padding:"22px",
            boxShadow:"0 12px 28px rgba(20,40,30,.06)"
          }}>
            <h3 style={{margin:"0 0 10px",fontSize:"18px"}}>{title}</h3>
            <p style={{margin:0,color:"#52665c",lineHeight:"1.5"}}>{body}</p>
          </div>
        ))}
      </section>

      <section style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"20px 28px 20px"
      }}>
        <div style={{
          background:"linear-gradient(135deg,#ffffff,#f5fcf7)",
          border:"1px solid #d9efe0",
          borderRadius:"28px",
          padding:"30px",
          boxShadow:"0 18px 40px rgba(20,60,30,.08)"
        }}>
          <div style={{
            fontSize:"13px",
            fontWeight:800,
            color:"#1f7a4d",
            marginBottom:"10px"
          }}>
            LIVE PROOF
          </div>

          <h2 style={{
            margin:"0 0 12px",
            fontSize:"34px",
            color:"#103024"
          }}>
            See HealthOI Think
          </h2>

          <p style={{
            margin:"0 0 24px",
            fontSize:"18px",
            color:"#53665d"
          }}>
            Real-style questions. Practical answers. Fast clarity.
          </p>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
            gap:"18px"
          }}>

            <div style={{
              background:"#fff",
              border:"1px solid #e5efe8",
              borderRadius:"18px",
              padding:"18px"
            }}>
              <strong>Q:</strong> Should I take magnesium while fasting?
              <hr style={{margin:"14px 0",border:"none",borderTop:"1px solid #edf3ef"}} />
              <strong>A:</strong> Usually yes, but dizziness during fasting often points to sodium / hydration first.
            </div>

            <div style={{
              background:"#fff",
              border:"1px solid #e5efe8",
              borderRadius:"18px",
              padding:"18px"
            }}>
              <strong>Q:</strong> Why am I tired after workouts at 45?
              <hr style={{margin:"14px 0",border:"none",borderTop:"1px solid #edf3ef"}} />
              <strong>A:</strong> Recovery debt, sleep quality, electrolytes, under-fueling, and cortisol load are common drivers.
            </div>

            <div style={{
              background:"#fff",
              border:"1px solid #e5efe8",
              borderRadius:"18px",
              padding:"18px"
            }}>
              <strong>Q:</strong> Is this supplement worth buying?
              <hr style={{margin:"14px 0",border:"none",borderTop:"1px solid #edf3ef"}} />
              <strong>A:</strong> Depends on ingredients, dose transparency, fillers, price efficiency, and your actual need.
            </div>

          </div>

          <div style={{marginTop:"24px"}}>
            <a href="#healthoi-chat" style={{
              background:"#103024",
              color:"#fff",
              padding:"14px 22px",
              borderRadius:"12px",
              textDecoration:"none",
              fontWeight:700
            }}>
              Ask HealthOI Now
            </a>
          </div>
        </div>
      </section>





<div id="healthoi-chat"></div>
<EmbeddedOIChat
        title="Ask HealthOI Now"
        modeHint="healthoi"
        nodeHint="ah3"
      />

<section id="examples" style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"42px 28px"
      }}>
        <div style={{
          background:"#fff",
          border:"1px solid #dce8e1",
          borderRadius:"28px",
          padding:"30px"
        }}>
          <h2 style={{fontSize:"34px",margin:"0 0 10px"}}>Ask better health questions.</h2>
          <p style={{color:"#52665c",fontSize:"18px",margin:"0 0 24px"}}>
            HealthOI is built for practical, everyday optimization questions.
          </p>

          <div style={{
            display:"grid",
            gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
            gap:"12px"
          }}>
            {[
              "Should I take magnesium while fasting?",
              "What stack helps stress and sleep?",
              "Why am I tired after workouts?",
              "Analyze this supplement label.",
              "How can I recover faster at 45?",
              "Is this health product worth buying?"
            ].map((q) => (
              <div key={q} style={{
                padding:"16px",
                borderRadius:"16px",
                background:"linear-gradient(135deg,#f2fbf6,#eef7ff)",
                border:"1px solid #cdeede",
                fontWeight:600
              }}>
                {q}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"10px 28px 30px"
      }}>
        <div style={{
          textAlign:"center",
          marginBottom:"26px"
        }}>
          <h2 style={{
            fontSize:"36px",
            margin:"0 0 10px",
            color:"#103024"
          }}>
            Founder Pricing
          </h2>

          <p style={{
            margin:0,
            color:"#53665d",
            fontSize:"18px"
          }}>
            Early supporters lock in launch pricing.
          </p>
        </div>

        <div style={{
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",
          gap:"18px"
        }}>

          <div style={{
            background:"#fff",
            border:"1px solid #e3ece6",
            borderRadius:"22px",
            padding:"24px"
          }}>
            <h3>Free</h3>
            <div style={{fontSize:"34px",fontWeight:800}}>0</div>
            <p>Basic access and beta updates.</p>
          </div>

          <div style={{
            background:"#ffffff",
            border:"2px solid #1f7a4d",
            borderRadius:"22px",
            padding:"24px",
            boxShadow:"0 20px 40px rgba(31,122,77,.10)"
          }}>
            <h3>Pro</h3>
            <div style={{fontSize:"34px",fontWeight:800}}>$19</div>
            <p>Unlimited chats, deeper analysis, premium features.</p>
          </div>

          <div style={{
            background:"#103024",
            color:"#fff",
            borderRadius:"22px",
            padding:"24px"
          }}>
            <h3>Founder</h3>
            <div style={{fontSize:"34px",fontWeight:800}}>$49</div>
            <p>Priority access, founder pricing, future perks.</p>
          </div>

        </div>
      </section>

<section style={{
        maxWidth:"1120px",
        margin:"0 auto",
        padding:"0 28px 70px"
      }}>
        <div style={{
          background:"linear-gradient(135deg,#0c2419,#155f3c 58%,#1d7f58)",
          color:"#fff",
          borderRadius:"28px",
          padding:"32px",
          display:"grid",
          gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))",
          gap:"24px",
          alignItems:"center"
        }}>
          <div>
            <h2 style={{fontSize:"32px",margin:"0 0 10px"}}>Join the Founding Beta Waitlist Waitlist</h2>
            <p style={{color:"#c7ddd2",lineHeight:"1.55",margin:0}}>
              Get early access, founder pricing, private invites, and priority access when paid plans launch.
            </p>
          </div>

          <div style={{textAlign:"right"}}>
            <a href="mailto:dan@optinodeiq.com?subject=Join HealthOI Waitlist" style={{
              display:"inline-block",
              background:"#fff",
              color:"#102019",
              padding:"16px 24px",
              borderRadius:"14px",
              textDecoration:"none",
              fontWeight:800
            }}>
              Join Waitlist
            </a>
          </div>
        </div>

        <p style={{
          margin:"22px 0 0",
          color:"#65776e",
          fontSize:"14px",
          lineHeight:"1.5"
        }}>
          HealthOI provides educational wellness insights and optimization guidance.
          It is not emergency care and does not replace a licensed medical professional.
        </p>
      </section>
    </main>
  );
}












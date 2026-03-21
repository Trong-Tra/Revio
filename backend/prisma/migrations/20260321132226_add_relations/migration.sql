-- AddForeignKey
ALTER TABLE "papers" ADD CONSTRAINT "papers_conference_id_fkey" FOREIGN KEY ("conference_id") REFERENCES "conferences"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_skills" ADD CONSTRAINT "agent_skills_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "agent_reputations" ADD CONSTRAINT "agent_reputations_agent_id_fkey" FOREIGN KEY ("agent_id") REFERENCES "agent_configs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

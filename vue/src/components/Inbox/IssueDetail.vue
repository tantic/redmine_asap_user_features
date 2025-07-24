<template>
  <div id="issue-detail" class="issue-detail" v-if="issue">
    <div class="entete">
      <a :href="'/issues/'+ issue.id +'/edit'" class="btn btn-default">
        <i class="fa fa-edit"></i>&nbsp;Modifier
      </a>
    </div>
    <div class="corps">
      <h3><a :href="'/issues/'+issue.id"><h2>{{issue.tracker.name}} #{{issue.id}} - {{issue.subject}} </h2></a></h3>
      <div class="ligne-0">
        <p class="author">
          Ajouté par {{issue.author.firstname }} {{issue.author.lastname }} le {{issue.created_on | formatDate}} <span v-if="issue.updated_on">mis à jour le {{issue.updated_on | formatDate}}</span>
        </p>
      </div>

      <ul class="attributs">
        <li class="ligne-1">
          <div class="status">
            <div class="label">Statut</div>
            <div class="value">{{ issue.status.name }}</div>
          </div>
          <div class="assigned_to" v-if="issue.assigned_to">
            <div class="label">Assigné à</div>
            <div v-if="issue.assigned_to.lastname" class="value"><a :href="'/users/' + issue.assigned_to.id">{{issue.assigned_to.firstname}} {{issue.assigned_to.lastname}}</a></div>
          </div>
          <div class="priority">
            <div class="label">Priorité</div>
            <div v-if="issue.priority" class="value" :class="issue.priority.name">{{issue.priority.name}}</div>
          </div>
          <div class="project-name">
            <div class="label">Projet</div>
            <div class="value"><a :href="'/projects/'+issue.project.identifier">{{issue.project.name }}</a></div>
          </div>

        </li>
        <li class="ligne-2">
            <div class="date-start">
              <div class="label">Début</div>
              <div v-if="issue.start_date" class="value">{{issue.start_date}}</div>
            </div>
            <div class="date-end">
              <div class="label">Echéance</div>
              <div v-if="issue.due_date" class="value" :class="{ 'late': issue.late }">{{issue.due_date}}</div>
            </div>
            <div class="version">
            <div class="label">Version cible</div>
              <div v-if="issue.fixed_version" class="value">{{issue.fixed_version.name}}</div>
            </div>
            <div class="pourcent">
              <div class="label">% réalisé</div>
              <div class="value">
                <div class="progress">
                  <div class="progress-bar" role="progressbar" :style="{width: issue.done_ratio + '%'}"  aria-valuemin="0" aria-valuemax="100">{{issue.done_ratio}}%</div>
                </div>
              </div>
            </div>
        </li>
        <li  v-if="issue.tags && issue.tags.length > 0">
          <div class="tags">
            <div class="label">Mots clés</div>
            <div class="value">
              <ul>
                <li v-for="tag in issue.tags" :key="tag.id">
                  <a :href="'/projects/'+ issue.project.identifier +'/issues?fields%5B%5D=issue_tags&fields%5B%5D=status_id&operators%5Bissue_tags%5D=%3D&operators%5Bstatus_id%5D=o&set_filter=1&values%5Bissue_tags%5D%5B%5D=' + tag.name + '&values%5Bstatus_id%5D%5B%5D='">{{tag.name}}</a>
                </li>
              </ul>
            </div>
          </div>
        </li>
      </ul>

      <div v-if="issue.description" v-html="issue.description" class="description"></div>
      <div v-else class="no-description">Aucune description</div>


      <div id="attachments" v-if="issue.attachments.length > 0">
        <h4>
           Pièces jointes <span class="badge">{{ issue.attachments.length}}</span>
        </h4>
        <!-- Affichage des pièces jointes -->
        <div class="attachments">
          <div v-for="attachment in issue.attachments" class="attachment" :key="attachment.id">
            <a :href="'/attachments/' + attachment.id" class="attachment-link">
              <div :class="'fiv-sqo ' + convertFileTypeToIcon(attachment.content_type) + ' fiv-size-lg'"></div>
              <div class="attachment-data">
                <span class="attachment-filename">{{attachment.filename}}</span>
                <div class="attachment-metadata">
                  <span class="attachment-size">{{attachment.filesize | prettyBytes}} - </span>
                  <span class="attachment-date">{{attachment.created_on | formatDate}}</span>
                </div>
              </div>
            </a>
          </div>
        </div>
      </div>

      <div id="checklists" v-if="issue.checklists && issue.checklists.length > 0">
        <h4>
          Tâches <span class="badge">{{ issue.checklists.length}}</span>
        </h4>
        <div class="checklists">
          <ul>
            <li v-for="checklist in issue.checklists" :key="checklist.id">
              {{checklist.subject}}
            </li>
          </ul>
        </div>
      </div>

      <div id="sous-taches" v-if="issue.descendants.length > 0">
        <h4>
          Relations <span class="badge">{{ issue.descendants.length}}</span>
        </h4>
        <div class="descendants">
          <h4>Demandes enfants</h4>
          <ul>
            <li v-for="descendant in issue.descendants" :key="descendant.id">
              <a :href="'/issues/'+descendant.id">{{descendant.tracker.name}} #{{descendant.id}} - {{descendant.subject}} </a>
            </li>
          </ul>
        </div>
      </div>

      <div v-if="issue.journals.length > 0" id="journal">
        <h4>
          Historique
        </h4>
        <div class="journals">
          <ul>
            <li v-for="journal in issue.journals" class="journal-detail" :key="journal.id">
                <div class="journal-detail-metadonnees">
                  <div class="journal-detail-auteur">{{journal.user.firstname}}&nbsp;{{journal.user.lastname}}</div>
                  <div class="journal-detail-date">{{journal.created_on | formatDate}}</div>
                </div>
                <ul v-if="journal.details.length > 0" class="journal-detail-revision">
                  <li v-for="detail in journal.details" :key="detail.id">
                    <p v-html="detail.value" class="details-texte"></p>
                  </li>
                </ul>
                <div v-if="journal.notes" v-html="journal.notes" class="note-commentaire-texte"></div>
              </li>
          </ul>
        </div>

      </div>
      <div class="no-comment" v-else>
        Aucun commentaire
      </div>
    </div>
  </div>
</template>

<script>

export default {
  name: 'IssueDetail',

  props: {
    issue: null,
  },
  methods: {

    convertFileTypeToIcon: function(mimeType){
      var icon_classes = {
        image: "fiv-icon-image",
        audio: "fiv-icon-au",
        video: "fiv-icon-mp4",
        "application/pdf": 'fiv-icon-pdf',
        "application/msword": 'fiv-icon-doc',
        "application/vnd.ms-word": 'fiv-icon-doc',
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document": 'fiv-icon-doc',
        "application/vnd.oasis.opendocument.text": 'fiv-icon-odt',
        "application/vnd.openxmlformats-officedocument.wordprocessingml": 'fiv-icon-odt',
        "application/vnd.ms-excel": 'fiv-icon-xls',
        "application/vnd.openxmlformats-officedocument.spreadsheetml": 'fiv-icon-ods',
        "application/vnd.oasis.opendocument.spreadsheet": 'fiv-icon-ods',
        "application/vnd.ms-powerpoint": 'fiv-icon-ppt',
        "application/vnd.openxmlformats-officedocument.presentationml": 'fiv-icon-ppt',
        "application/vnd.oasis.opendocument.presentation": 'fiv-icon-ppt',
        "application/vnd.oasis.opendocument.graphics": 'fiv-icon-image',
        "text/plain": 'fiv-icon-txt',
        "text/html": 'fiv-icon-html',
        "application/json": 'fiv-icon-json',
        "application/gzip": 'fiv-icon-zip',
        "application/zip": 'fiv-icon-zip'
      }
      if (mimeType != null){
        for (var key in icon_classes) {
          // if (icon_classes.hasOwnProperty(key)) {
            if (mimeType.search(key) === 0) {
              return icon_classes[key];
            }
          // } else {
          //   return "fiv-icon-blank";
          // }
        }
      }else{
        return "fiv-icon-blank";
      }
    },

  },


}



</script>

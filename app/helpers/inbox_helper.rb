module InboxHelper
    include ApplicationHelper
    include ActionView::Helpers::TagHelper   
    include ERB::Util 
    include CustomFieldsHelper
    
    def show_detail_inbox(detail, no_html=false, options={})
        multiple = false
        show_diff = false
        no_details = false

        case detail.property
        when 'attr'
            field = detail.prop_key.to_s.gsub(/\_id$/, "")
            label = l(("field_" + field).to_sym)
        case detail.prop_key
        when 'due_date', 'start_date'
            value = format_date(detail.value.to_date) if detail.value
            old_value = format_date(detail.old_value.to_date) if detail.old_value

        when 'project_id', 'status_id', 'tracker_id', 'assigned_to_id',
                'priority_id', 'category_id', 'fixed_version_id'
            value = find_name_by_reflection(field, detail.value)
            old_value = find_name_by_reflection(field, detail.old_value)

        when 'estimated_hours'
            value = l_hours_short(detail.value.to_f) unless detail.value.blank?
            old_value = l_hours_short(detail.old_value.to_f) unless detail.old_value.blank?

        when 'parent_id'
            label = l(:field_parent_issue)
            value = "##{detail.value}" unless detail.value.blank?
            old_value = "##{detail.old_value}" unless detail.old_value.blank?

        when 'is_private'
            value = l(detail.value == "0" ? :general_text_No : :general_text_Yes) unless detail.value.blank?
            old_value = l(detail.old_value == "0" ? :general_text_No : :general_text_Yes) unless detail.old_value.blank?

        when 'description'
            show_diff = true
        end
        when 'cf'
            custom_field = detail.custom_field
            if custom_field
                label = custom_field.name
                if custom_field.format.class.change_no_details
                    no_details = true
                elsif custom_field.format.class.change_as_diff
                    show_diff = true
                else
                    multiple = custom_field.multiple?
                    value = format_value(detail.value, custom_field) if detail.value
                    old_value = format_value(detail.old_value, custom_field) if detail.old_value
                end
            end
        when 'attachment'
            label = l(:label_attachment)
        when 'relation'
            if detail.value && !detail.old_value
                rel_issue = Issue.visible.find_by_id(detail.value)
                value =
                if rel_issue.nil?
                    "#{l(:label_issue)} ##{detail.value}"
                else
                    (no_html ? rel_issue : link_to_issue(rel_issue, :only_path => options[:only_path]))
                end
            elsif detail.old_value && !detail.value
                rel_issue = Issue.visible.find_by_id(detail.old_value)
                old_value =
                if rel_issue.nil?
                    "#{l(:label_issue)} ##{detail.old_value}"
                else
                    (no_html ? rel_issue : link_to_issue(rel_issue, :only_path => options[:only_path]))
                end
            end
            relation_type = IssueRelation::TYPES[detail.prop_key]
            label = l(relation_type[:name]) if relation_type
        end
        call_hook(:helper_issues_show_detail_after_setting,
                {:detail => detail, :label => label, :value => value, :old_value => old_value })

        label ||= detail.prop_key
        value ||= detail.value
        old_value ||= detail.old_value

        unless no_html
        label = content_tag('strong', label)
        old_value = content_tag("i", h(old_value)) if detail.old_value
        if detail.old_value && detail.value.blank? && detail.property != 'relation'
            old_value = content_tag("del", old_value)
        end
        if detail.property == 'attachment' && value.present? &&
            atta = detail.journal.journalized.attachments.detect {|a| a.id == detail.prop_key.to_i}
            # Link to the attachment if it has not been removed
            value = link_to_attachment(atta, only_path: options[:only_path])
            if options[:only_path] != false
            value += ' '
            value += link_to_attachment atta, class: 'icon-only icon-download', title: l(:button_download), download: true
            end
        else
            value = content_tag("i", h(value)) if value
        end
    end

    if no_details
      s = l(:text_journal_changed_no_detail, :label => label).html_safe
    elsif show_diff
      s = l(:text_journal_changed_no_detail, :label => label)
      unless no_html
        diff_link =
          link_to(
            'diff',
            diff_journal_url(detail.journal_id, :detail_id => detail.id,
                             :only_path => options[:only_path]),
            :title => l(:label_view_diff))
        s << " (#{diff_link})"
      end
      s.html_safe
    elsif detail.value.present?
      case detail.property
      when 'attr', 'cf'
        if detail.old_value.present?
          l(:text_journal_changed, :label => label, :old => old_value, :new => value).html_safe
        elsif multiple
          l(:text_journal_added, :label => label, :value => value).html_safe
        else
          l(:text_journal_set_to, :label => label, :value => value).html_safe
        end
      when 'attachment', 'relation'
        l(:text_journal_added, :label => label, :value => value).html_safe
      end
    else
      l(:text_journal_deleted, :label => label, :old => old_value).html_safe
    end
  end

    def details_to_strings_inbox(details, no_html=false, options={})
        options[:only_path] = !(options[:only_path] == false)
        strings = []
        values_by_field = {}
        details.each do |detail|
            if detail.property == 'cf'
                field = detail.custom_field
                if field && field.multiple?
                    values_by_field[field] ||= {:added => [], :deleted => []}
                    if detail.old_value
                        values_by_field[field][:deleted] << detail.old_value
                    end
                    if detail.value
                        values_by_field[field][:added] << detail.value
                    end
                    next
                end
            end
            strings << show_detail_inbox(detail, no_html, options)
        end
        if values_by_field.present?
            values_by_field.each do |field, changes|
                if changes[:added].any?
                    detail = MultipleValuesDetail.new('cf', field.id.to_s, field)
                    detail.value = changes[:added]
                    strings << show_detail_inbox(detail, no_html, options)
                end
                if changes[:deleted].any?
                    detail = MultipleValuesDetail.new('cf', field.id.to_s, field)
                    detail.old_value = changes[:deleted]
                    strings << show_detail_inbox(detail, no_html, options)
                end
            end
        end
        strings
    end
end
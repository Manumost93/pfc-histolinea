using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;

namespace Histolinea.Application.DTOs
{
    public sealed class CreateHistoricalEventDto : IValidatableObject
    {
        [Required(ErrorMessage = "El título es obligatorio")]
        [StringLength(200, ErrorMessage = "El título no puede superar los 200 caracteres")]
        public string Title { get; set; } = default!;

        [StringLength(4000, ErrorMessage = "La descripción no puede superar los 4000 caracteres")]
        public string? Description { get; set; }

        [Required(ErrorMessage = "La fecha de inicio es obligatoria")]
        public DateTime StartDate { get; set; }

        public DateTime? EndDate { get; set; }

        [StringLength(500, ErrorMessage = "La URL de la imagen no puede superar los 500 caracteres")]
        [Url(ErrorMessage = "La URL de la imagen no es válida")]
        public string? ImageUrl { get; set; }

        [StringLength(500, ErrorMessage = "La fuente no puede superar los 500 caracteres")]
        [Url(ErrorMessage = "La URL de la fuente no es válida")]
        public string? SourceUrl { get; set; }

        public IEnumerable<ValidationResult> Validate(ValidationContext validationContext)
        {
            if (EndDate.HasValue && EndDate.Value < StartDate)
            {
                yield return new ValidationResult(
                    "La fecha de fin no puede ser anterior a la fecha de inicio.",
                    new[] { nameof(EndDate) }
                );
            }
        }
    }
}

